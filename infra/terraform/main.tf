terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 7.0"
    }
  }

  backend "gcs" {
    bucket = "anua-v2-terraform-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "iamcredentials.googleapis.com",
  ])

  service            = each.key
  disable_on_destroy = false
}

# ==============================================================================
# ARTIFACT REGISTRY
# ==============================================================================

resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.region
  repository_id = "${var.project_name}-docker"
  description   = "Docker repository for ${var.project_name}"
  format        = "DOCKER"

  cleanup_policies {
    id     = "keep-minimum-versions"
    action = "KEEP"
    most_recent_versions {
      keep_count = 5
    }
  }

  cleanup_policies {
    id     = "delete-old-untagged"
    action = "DELETE"
    condition {
      tag_state  = "UNTAGGED"
      older_than = "2592000s" # 30 days
    }
  }

  depends_on = [google_project_service.required_apis]
}

# ==============================================================================
# SECRET MANAGER
# ==============================================================================

resource "google_secret_manager_secret" "app_key" {
  secret_id = "${var.environment}-${var.project_name}-app-key"

  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "app_key" {
  secret      = google_secret_manager_secret.app_key.id
  secret_data = var.app_key
}

resource "google_secret_manager_secret" "db_password" {
  secret_id = "${var.environment}-${var.project_name}-db-password"

  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = var.db_password
}

resource "google_secret_manager_secret" "smtp_password" {
  secret_id = "${var.environment}-${var.project_name}-smtp-password"

  replication {
    auto {}
  }

  depends_on = [google_project_service.required_apis]
}

resource "google_secret_manager_secret_version" "smtp_password" {
  secret      = google_secret_manager_secret.smtp_password.id
  secret_data = var.smtp_password
}

# Grant Cloud Run access to secrets
resource "google_secret_manager_secret_iam_member" "app_key_access" {
  secret_id = google_secret_manager_secret.app_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

resource "google_secret_manager_secret_iam_member" "db_password_access" {
  secret_id = google_secret_manager_secret.db_password.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

resource "google_secret_manager_secret_iam_member" "smtp_password_access" {
  secret_id = google_secret_manager_secret.smtp_password.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

data "google_project" "project" {
  project_id = var.project_id
}

# ==============================================================================
# CLOUD STORAGE - UPLOADS
# ==============================================================================

resource "google_storage_bucket" "uploads" {
  name          = "${var.project_id}-uploads"
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }
}

# Make bucket publicly readable
resource "google_storage_bucket_iam_member" "uploads_public_read" {
  bucket = google_storage_bucket.uploads.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# Grant Cloud Run service account write access
resource "google_storage_bucket_iam_member" "uploads_cloud_run_write" {
  bucket = google_storage_bucket.uploads.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

# ==============================================================================
# CLOUD RUN - API
# ==============================================================================

module "api" {
  source = "./modules/cloud-run"

  project_id   = var.project_id
  project_name = var.project_name
  environment  = var.environment
  region       = var.region
  service_name = "api"
  image        = var.api_image

  container_port = 3333

  env_vars = {
    NODE_ENV       = var.environment
    HOST           = "0.0.0.0"
    TZ             = "UTC"
    LOG_LEVEL      = "info"
    SESSION_DRIVER = "cookie"
    # Database (existing from school-super-app)
    DB_HOST     = "34.39.158.54"
    DB_PORT     = "5432"
    DB_USER     = "app_user"
    DB_DATABASE = "school_super_app"
    # SMTP
    SMTP_HOST       = "smtp.resend.com"
    SMTP_PORT       = "465"
    SMTP_USER       = "resend"
    SMTP_FROM_EMAIL = "Anuá <dont-reply@transactional.anuaapp.com.br>"
    # Storage
    DRIVE_DISK = "gcs"
    GCS_BUCKET = google_storage_bucket.uploads.name
  }

  secrets = {
    APP_KEY = {
      secret_id = google_secret_manager_secret.app_key.secret_id
      version   = "latest"
    }
    DB_PASSWORD = {
      secret_id = google_secret_manager_secret.db_password.secret_id
      version   = "latest"
    }
    SMTP_PASSWORD = {
      secret_id = google_secret_manager_secret.smtp_password.secret_id
      version   = "latest"
    }
  }

  depends_on = [
    google_project_service.required_apis,
    google_secret_manager_secret_version.app_key,
    google_secret_manager_secret_version.db_password,
    google_secret_manager_secret_version.smtp_password,
    google_storage_bucket.uploads,
  ]
}

# ==============================================================================
# CLOUD RUN JOB - MIGRATIONS
# ==============================================================================

module "migrate" {
  source = "./modules/cloud-run-job"

  project_id = var.project_id
  region     = var.region
  job_name   = "${var.environment}-${var.project_name}-migrate"
  image      = var.api_image

  command = ["node"]
  args    = ["ace", "migration:run", "--force"]

  env_vars = {
    NODE_ENV       = var.environment
    TZ             = "UTC"
    LOG_LEVEL      = "info"
    SESSION_DRIVER = "cookie"
    APP_KEY        = var.app_key
    # Database (existing from school-super-app)
    DB_HOST     = "34.39.158.54"
    DB_PORT     = "5432"
    DB_USER     = "app_user"
    DB_PASSWORD = var.db_password
    DB_DATABASE = "school_super_app"
  }

  timeout      = "600s"
  max_retries  = 0
  cpu_limit    = "1000m"
  memory_limit = "512Mi"

  depends_on = [
    google_project_service.required_apis,
  ]
}

# ==============================================================================
# GITHUB ACTIONS - WORKLOAD IDENTITY FEDERATION
# ==============================================================================

resource "google_iam_workload_identity_pool" "github_pool" {
  workload_identity_pool_id = "github-pool"
  display_name              = "GitHub Pool"
  description               = "Identity pool for GitHub Actions"

  depends_on = [google_project_service.required_apis]
}

resource "google_iam_workload_identity_pool_provider" "github_provider" {
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  display_name                       = "GitHub Provider"

  attribute_mapping = {
    "google.subject"             = "assertion.sub"
    "attribute.actor"            = "assertion.actor"
    "attribute.repository"       = "assertion.repository"
    "attribute.repository_owner" = "assertion.repository_owner"
  }

  attribute_condition = "assertion.repository_owner == '${var.github_repository_owner}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account" "github_actions" {
  account_id   = "github-actions-deployer"
  display_name = "GitHub Actions Deployer"
  description  = "Service account for GitHub Actions CI/CD"
}

resource "google_project_iam_member" "github_actions_roles" {
  for_each = toset([
    "roles/artifactregistry.writer",
    "roles/run.admin",
    "roles/iam.serviceAccountUser",
    "roles/storage.admin",
  ])

  project = var.project_id
  role    = each.key
  member  = "serviceAccount:${google_service_account.github_actions.email}"
}

resource "google_service_account_iam_member" "github_actions_workload_identity" {
  service_account_id = google_service_account.github_actions.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool.name}/attribute.repository/${var.github_repository_owner}/${var.project_name}"
}
