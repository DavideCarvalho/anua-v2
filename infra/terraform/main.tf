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
    "sqladmin.googleapis.com",
    "vpcaccess.googleapis.com",
    "compute.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "servicenetworking.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "iamcredentials.googleapis.com",
  ])

  service            = each.key
  disable_on_destroy = false
}

# VPC Network
resource "google_compute_network" "vpc" {
  name                    = "${var.project_name}-vpc"
  auto_create_subnetworks = false

  depends_on = [google_project_service.required_apis]
}

# Subnet
resource "google_compute_subnetwork" "subnet" {
  name          = "${var.project_name}-subnet"
  ip_cidr_range = "10.0.0.0/24"
  region        = var.region
  network       = google_compute_network.vpc.id

  private_ip_google_access = true
}

# Reserve IP range for private service access (Cloud SQL)
resource "google_compute_global_address" "private_ip_range" {
  name          = "private-ip-range"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc.id

  depends_on = [google_project_service.required_apis]
}

# Create private service connection
resource "google_service_networking_connection" "private_vpc_connection" {
  network                 = google_compute_network.vpc.id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_range.name]

  depends_on = [google_project_service.required_apis]
}

# VPC Connector for Cloud Run
resource "google_vpc_access_connector" "connector" {
  name          = "vpc-connector"
  region        = var.region
  network       = google_compute_network.vpc.name
  ip_cidr_range = "10.8.0.0/28"

  depends_on = [google_project_service.required_apis]
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
# DATABASE
# ==============================================================================

module "database" {
  source = "./modules/database"

  project_id   = var.project_id
  project_name = var.project_name
  environment  = var.environment
  region       = var.region
  network_id   = google_compute_network.vpc.id

  database_name = "anua_v2"
  database_user = "app_user"

  depends_on = [
    google_project_service.required_apis,
    google_service_networking_connection.private_vpc_connection
  ]
}

# ==============================================================================
# CLOUD RUN - API
# ==============================================================================

module "api" {
  source = "./modules/cloud-run"

  project_id    = var.project_id
  project_name  = var.project_name
  environment   = var.environment
  region        = var.region
  service_name  = "api"
  image         = var.api_image
  vpc_connector = google_vpc_access_connector.connector.id

  container_port = 3000

  env_vars = {
    DATABASE_URL = module.database.connection_string_vpc
    NODE_ENV     = var.environment
    HOST         = "0.0.0.0"
    PORT         = "3000"
    APP_KEY      = var.app_key
    SESSION_DRIVER = "cookie"
  }

  depends_on = [
    google_project_service.required_apis,
    module.database
  ]
}

# ==============================================================================
# CLOUD RUN JOB - MIGRATIONS
# ==============================================================================

module "migrate" {
  source = "./modules/cloud-run-job"

  project_id    = var.project_id
  region        = var.region
  job_name      = "${var.environment}-${var.project_name}-migrate"
  image         = var.api_image
  vpc_connector = google_vpc_access_connector.connector.id

  command = ["node"]
  args    = ["ace", "migration:run", "--force"]

  env_vars = {
    DATABASE_URL   = module.database.connection_string_vpc
    NODE_ENV       = var.environment
    HOST           = "0.0.0.0"
    PORT           = "3000"
    APP_KEY        = var.app_key
    SESSION_DRIVER = "cookie"
  }

  timeout      = "600s"
  max_retries  = 0
  cpu_limit    = "1000m"
  memory_limit = "512Mi"

  depends_on = [
    google_project_service.required_apis,
    module.database
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
