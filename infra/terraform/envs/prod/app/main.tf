# ==============================================================================
# CLOUD RUN - API
# ==============================================================================

module "api" {
  source = "../../../modules/cloud-run"

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
    GCS_BUCKET = data.terraform_remote_state.storage.outputs.uploads_bucket_name
  }

  secrets = {
    APP_KEY = {
      secret_id = data.terraform_remote_state.storage.outputs.app_key_secret_id
      version   = "latest"
    }
    DB_PASSWORD = {
      secret_id = data.terraform_remote_state.storage.outputs.db_password_secret_id
      version   = "latest"
    }
    SMTP_PASSWORD = {
      secret_id = data.terraform_remote_state.storage.outputs.smtp_password_secret_id
      version   = "latest"
    }
  }
}

# ==============================================================================
# CLOUD RUN JOB - MIGRATIONS
# ==============================================================================

module "migrate" {
  source = "../../../modules/cloud-run-job"

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
}

# ==============================================================================
# CLOUD RUN - QUEUE WORKER
# ==============================================================================

module "queue_worker" {
  source = "../../../modules/cloud-run-worker"

  project_id   = var.project_id
  project_name = var.project_name
  environment  = var.environment
  region       = var.region
  service_name = "queue-worker"
  image        = var.api_image # Uses the same image as API

  command = ["node"]
  args    = ["ace", "queue:work"]

  # Keep 1 instance always running to process jobs
  min_instances = 1
  max_instances = 2
  cpu_limit     = "1"
  memory_limit  = "1Gi"

  env_vars = {
    NODE_ENV          = var.environment
    TZ                = "UTC"
    LOG_LEVEL         = "info"
    SESSION_DRIVER    = "cookie"
    DISABLE_SCHEDULER = "1"
    # Database
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
    GCS_BUCKET = data.terraform_remote_state.storage.outputs.uploads_bucket_name
  }

  secrets = {
    APP_KEY = {
      secret_id = data.terraform_remote_state.storage.outputs.app_key_secret_id
      version   = "latest"
    }
    DB_PASSWORD = {
      secret_id = data.terraform_remote_state.storage.outputs.db_password_secret_id
      version   = "latest"
    }
    SMTP_PASSWORD = {
      secret_id = data.terraform_remote_state.storage.outputs.smtp_password_secret_id
      version   = "latest"
    }
  }
}

# ==============================================================================
# CLOUD RUN - SCHEDULER
# ==============================================================================

module "scheduler" {
  source = "../../../modules/cloud-run-worker"

  project_id   = var.project_id
  project_name = var.project_name
  environment  = var.environment
  region       = var.region
  service_name = "scheduler"
  image        = var.api_image # Uses the same image as API

  command = ["node"]
  args    = ["ace", "scheduler:serve"]

  # Keep 1 instance always running for scheduled tasks
  min_instances = 1
  max_instances = 1
  cpu_limit     = "1"
  memory_limit  = "512Mi"

  env_vars = {
    NODE_ENV       = var.environment
    TZ             = "UTC"
    LOG_LEVEL      = "info"
    SESSION_DRIVER = "cookie"
    # Database
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
    GCS_BUCKET = data.terraform_remote_state.storage.outputs.uploads_bucket_name
  }

  secrets = {
    APP_KEY = {
      secret_id = data.terraform_remote_state.storage.outputs.app_key_secret_id
      version   = "latest"
    }
    DB_PASSWORD = {
      secret_id = data.terraform_remote_state.storage.outputs.db_password_secret_id
      version   = "latest"
    }
    SMTP_PASSWORD = {
      secret_id = data.terraform_remote_state.storage.outputs.smtp_password_secret_id
      version   = "latest"
    }
  }
}
