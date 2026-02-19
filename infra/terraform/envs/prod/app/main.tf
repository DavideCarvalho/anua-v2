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
    ASAAS_API_KEY = {
      secret_id = data.terraform_remote_state.storage.outputs.asaas_api_key_secret_id
      version   = "latest"
    }
    ASAAS_WEBHOOK_URL = {
      secret_id = data.terraform_remote_state.storage.outputs.asaas_webhook_url_secret_id
      version   = "latest"
    }
    ASAAS_WEBHOOK_TOKEN = {
      secret_id = data.terraform_remote_state.storage.outputs.asaas_webhook_token_secret_id
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
    ASAAS_API_KEY = {
      secret_id = data.terraform_remote_state.storage.outputs.asaas_api_key_secret_id
      version   = "latest"
    }
    ASAAS_WEBHOOK_URL = {
      secret_id = data.terraform_remote_state.storage.outputs.asaas_webhook_url_secret_id
      version   = "latest"
    }
    ASAAS_WEBHOOK_TOKEN = {
      secret_id = data.terraform_remote_state.storage.outputs.asaas_webhook_token_secret_id
      version   = "latest"
    }
  }
}

# ==============================================================================
# CLOUD RUN JOBS - DISPATCH JOBS (triggered by Cloud Scheduler)
# ==============================================================================

module "dispatch_missing_payments" {
  source = "../../../modules/cloud-run-job"

  project_id = var.project_id
  region     = var.region
  job_name   = "${var.environment}-${var.project_name}-dispatch-missing-payments"
  image      = var.api_image

  command = ["node"]
  args    = ["ace", "dispatch:generate-missing-payments"]

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
  }

  timeout      = "300s"
  max_retries  = 0
  cpu_limit    = "1000m"
  memory_limit = "512Mi"
}

module "dispatch_invoices" {
  source = "../../../modules/cloud-run-job"

  project_id = var.project_id
  region     = var.region
  job_name   = "${var.environment}-${var.project_name}-dispatch-invoices"
  image      = var.api_image

  command = ["node"]
  args    = ["ace", "dispatch:generate-invoices"]

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
  }

  timeout      = "300s"
  max_retries  = 0
  cpu_limit    = "1000m"
  memory_limit = "512Mi"
}

module "dispatch_overdue" {
  source = "../../../modules/cloud-run-job"

  project_id = var.project_id
  region     = var.region
  job_name   = "${var.environment}-${var.project_name}-dispatch-overdue"
  image      = var.api_image

  command = ["node"]
  args    = ["ace", "dispatch:mark-overdue-invoices"]

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
  }

  timeout      = "300s"
  max_retries  = 0
  cpu_limit    = "1000m"
  memory_limit = "512Mi"
}

module "dispatch_occurrence_ack_reminders" {
  source = "../../../modules/cloud-run-job"

  project_id = var.project_id
  region     = var.region
  job_name   = "${var.environment}-${var.project_name}-dispatch-occurrence-ack-reminders"
  image      = var.api_image

  command = ["node"]
  args    = ["ace", "dispatch:send-occurrence-ack-reminders"]

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
  }

  timeout      = "300s"
  max_retries  = 0
  cpu_limit    = "1000m"
  memory_limit = "512Mi"
}

module "dispatch_asaas_charges" {
  source = "../../../modules/cloud-run-job"

  project_id = var.project_id
  region     = var.region
  job_name   = "${var.environment}-${var.project_name}-dispatch-asaas-charges"
  image      = var.api_image

  command = ["node"]
  args    = ["ace", "dispatch:create-invoice-asaas-charges"]

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
  }

  timeout      = "300s"
  max_retries  = 0
  cpu_limit    = "1000m"
  memory_limit = "512Mi"
}

module "dispatch_invoice_interest" {
  source = "../../../modules/cloud-run-job"

  project_id = var.project_id
  region     = var.region
  job_name   = "${var.environment}-${var.project_name}-dispatch-invoice-interest"
  image      = var.api_image

  command = ["node"]
  args    = ["ace", "dispatch:apply-invoice-interest"]

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
  }

  timeout      = "300s"
  max_retries  = 0
  cpu_limit    = "1000m"
  memory_limit = "512Mi"
}

module "dispatch_invoice_notifications" {
  source = "../../../modules/cloud-run-job"

  project_id = var.project_id
  region     = var.region
  job_name   = "${var.environment}-${var.project_name}-dispatch-invoice-notifications"
  image      = var.api_image

  command = ["node"]
  args    = ["ace", "dispatch:send-invoice-notifications"]

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
  }

  timeout      = "300s"
  max_retries  = 0
  cpu_limit    = "1000m"
  memory_limit = "512Mi"
}

# ==============================================================================
# SERVICE ACCOUNT - CLOUD SCHEDULER
# ==============================================================================

resource "google_service_account" "scheduler" {
  account_id   = "cloud-scheduler-invoker"
  display_name = "Cloud Scheduler Job Invoker"
  description  = "Service account used by Cloud Scheduler to trigger Cloud Run Jobs"
}

resource "google_project_iam_member" "scheduler_run_invoker" {
  project = var.project_id
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.scheduler.email}"
}

# ==============================================================================
# CLOUD SCHEDULER - CRON TRIGGERS
# ==============================================================================

module "scheduler_missing_payments" {
  source = "../../../modules/cloud-scheduler"

  project_id            = var.project_id
  region                = var.region
  job_name              = "${var.environment}-${var.project_name}-dispatch-missing-payments"
  schedule              = "0 2 * * *"
  cloud_run_job_name    = module.dispatch_missing_payments.job_name
  service_account_email = google_service_account.scheduler.email
}

module "scheduler_invoices" {
  source = "../../../modules/cloud-scheduler"

  project_id            = var.project_id
  region                = var.region
  job_name              = "${var.environment}-${var.project_name}-dispatch-invoices"
  schedule              = "0 3 * * *"
  cloud_run_job_name    = module.dispatch_invoices.job_name
  service_account_email = google_service_account.scheduler.email
}

module "scheduler_overdue" {
  source = "../../../modules/cloud-scheduler"

  project_id            = var.project_id
  region                = var.region
  job_name              = "${var.environment}-${var.project_name}-dispatch-overdue"
  schedule              = "0 5 * * *"
  cloud_run_job_name    = module.dispatch_overdue.job_name
  service_account_email = google_service_account.scheduler.email
}

module "scheduler_asaas_charges" {
  source = "../../../modules/cloud-scheduler"

  project_id            = var.project_id
  region                = var.region
  job_name              = "${var.environment}-${var.project_name}-dispatch-asaas-charges"
  schedule              = "0 6 * * *"
  cloud_run_job_name    = module.dispatch_asaas_charges.job_name
  service_account_email = google_service_account.scheduler.email
}

module "scheduler_invoice_interest" {
  source = "../../../modules/cloud-scheduler"

  project_id            = var.project_id
  region                = var.region
  job_name              = "${var.environment}-${var.project_name}-dispatch-invoice-interest"
  schedule              = "30 5 * * *"
  cloud_run_job_name    = module.dispatch_invoice_interest.job_name
  service_account_email = google_service_account.scheduler.email
}

module "scheduler_invoice_notifications" {
  source = "../../../modules/cloud-scheduler"

  project_id            = var.project_id
  region                = var.region
  job_name              = "${var.environment}-${var.project_name}-dispatch-invoice-notifications"
  schedule              = "30 6 * * *"
  cloud_run_job_name    = module.dispatch_invoice_notifications.job_name
  service_account_email = google_service_account.scheduler.email
}

module "scheduler_occurrence_ack_reminders" {
  source = "../../../modules/cloud-scheduler"

  project_id            = var.project_id
  region                = var.region
  job_name              = "${var.environment}-${var.project_name}-dispatch-occurrence-ack-reminders"
  schedule              = "0 9 * * 1-5"
  cloud_run_job_name    = module.dispatch_occurrence_ack_reminders.job_name
  service_account_email = google_service_account.scheduler.email
}
