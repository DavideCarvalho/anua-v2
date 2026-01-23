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
