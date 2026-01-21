variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "anua-v2"
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "southamerica-east1"
}

variable "environment" {
  description = "Environment (development, staging, production)"
  type        = string
  default     = "development"
}

variable "api_image" {
  description = "Docker image for API service"
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello" # Placeholder
}

variable "app_key" {
  description = "AdonisJS APP_KEY for encryption"
  type        = string
  sensitive   = true
}

variable "github_repository_owner" {
  description = "GitHub repository owner (user or organization)"
  type        = string
  default     = "DavideCarvalho"
}

# Database
variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

# SMTP
variable "smtp_password" {
  description = "SMTP password (Resend API key)"
  type        = string
  sensitive   = true
}
