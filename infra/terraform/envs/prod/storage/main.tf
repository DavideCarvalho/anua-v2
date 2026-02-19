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
# SECRET MANAGER
# ==============================================================================
# Note: Secret versions are managed outside of Terraform (via gcloud or console)
# to avoid recreating versions on every apply

resource "google_secret_manager_secret" "app_key" {
  secret_id = "${var.environment}-${var.project_name}-app-key"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "db_password" {
  secret_id = "${var.environment}-${var.project_name}-db-password"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "smtp_password" {
  secret_id = "${var.environment}-${var.project_name}-smtp-password"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "asaas_api_key" {
  secret_id = "${var.environment}-${var.project_name}-asaas-api-key"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "asaas_webhook_url" {
  secret_id = "${var.environment}-${var.project_name}-asaas-webhook-url"

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret" "asaas_webhook_token" {
  secret_id = "${var.environment}-${var.project_name}-asaas-webhook-token"

  replication {
    auto {}
  }
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

resource "google_secret_manager_secret_iam_member" "asaas_api_key_access" {
  secret_id = google_secret_manager_secret.asaas_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

resource "google_secret_manager_secret_iam_member" "asaas_webhook_url_access" {
  secret_id = google_secret_manager_secret.asaas_webhook_url.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}

resource "google_secret_manager_secret_iam_member" "asaas_webhook_token_access" {
  secret_id = google_secret_manager_secret.asaas_webhook_token.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${data.google_project.project.number}-compute@developer.gserviceaccount.com"
}
