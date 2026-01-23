variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "anua-480822"
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "southamerica-east1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "project_name" {
  description = "Project name used for naming resources"
  type        = string
  default     = "anua-v2"
}

variable "api_image" {
  description = "Container image for the API"
  type        = string
  default     = "southamerica-east1-docker.pkg.dev/anua-480822/anua-v2-docker/api:latest"
}

variable "app_key" {
  description = "AdonisJS APP_KEY (for migration job)"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password (for migration job)"
  type        = string
  sensitive   = true
}
