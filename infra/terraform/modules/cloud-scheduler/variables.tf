variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "job_name" {
  description = "Cloud Scheduler job name"
  type        = string
}

variable "schedule" {
  description = "Cron schedule expression"
  type        = string
}

variable "time_zone" {
  description = "Time zone for the schedule"
  type        = string
  default     = "UTC"
}

variable "cloud_run_job_name" {
  description = "Name of the Cloud Run Job to trigger"
  type        = string
}

variable "service_account_email" {
  description = "Service account email for OAuth authentication"
  type        = string
}

variable "retry_count" {
  description = "Number of retries for failed attempts"
  type        = number
  default     = 1
}

variable "max_retry_duration" {
  description = "Maximum retry duration"
  type        = string
  default     = "0s"
}
