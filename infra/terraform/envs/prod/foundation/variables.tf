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

variable "project_name" {
  description = "Project name used for naming resources"
  type        = string
  default     = "anua-v2"
}

variable "github_repository_owner" {
  description = "GitHub repository owner"
  type        = string
  default     = "DavideCarvalho"
}
