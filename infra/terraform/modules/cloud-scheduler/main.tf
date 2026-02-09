resource "google_cloud_scheduler_job" "job" {
  name      = var.job_name
  schedule  = var.schedule
  time_zone = var.time_zone
  region    = var.region
  project   = var.project_id

  http_target {
    http_method = "POST"
    uri         = "https://${var.region}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${var.project_id}/jobs/${var.cloud_run_job_name}:run"

    oauth_token {
      service_account_email = var.service_account_email
    }
  }

  retry_config {
    retry_count          = var.retry_count
    max_retry_duration   = var.max_retry_duration
    min_backoff_duration = "5s"
    max_backoff_duration = "3600s"
  }
}
