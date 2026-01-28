# Cloud Run Service for long-running workers (queue, scheduler)
# These services don't expose HTTP endpoints, so we don't use probes

resource "google_cloud_run_v2_service" "worker" {
  name     = "${var.environment}-${var.project_name}-${var.service_name}"
  location = var.region

  labels = {
    environment = var.environment
    service     = var.service_name
    managed_by  = "terraform"
    project     = var.project_name
    type        = "worker"
  }

  template {
    # Scaling configuration
    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    # VPC Access (optional)
    dynamic "vpc_access" {
      for_each = var.vpc_connector != null ? [1] : []
      content {
        connector = var.vpc_connector
        egress    = "PRIVATE_RANGES_ONLY"
      }
    }

    # Container configuration
    containers {
      image   = var.image
      command = var.command
      args    = var.args

      resources {
        limits = {
          cpu    = var.cpu_limit
          memory = var.memory_limit
        }
        cpu_idle          = false # Workers should always have CPU available
        startup_cpu_boost = true
      }

      # Environment variables
      dynamic "env" {
        for_each = var.env_vars
        content {
          name  = env.key
          value = env.value
        }
      }

      # Secrets as environment variables
      dynamic "env" {
        for_each = var.secrets
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = env.value.secret_id
              version = env.value.version
            }
          }
        }
      }

      # No HTTP probes for workers - they don't expose HTTP endpoints
      # Cloud Run will consider the container healthy as long as the process is running
    }

    service_account       = var.service_account_email
    timeout               = "${var.timeout_seconds}s"
    execution_environment = "EXECUTION_ENVIRONMENT_GEN2"
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
    ]
  }
}
