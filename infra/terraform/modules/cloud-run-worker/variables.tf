variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name (prod, dev, demo)"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "service_name" {
  description = "Cloud Run service name"
  type        = string
}

variable "image" {
  description = "Container image"
  type        = string
}

variable "command" {
  description = "Container command"
  type        = list(string)
  default     = []
}

variable "args" {
  description = "Container arguments"
  type        = list(string)
  default     = []
}

variable "vpc_connector" {
  description = "VPC connector ID (optional)"
  type        = string
  default     = null
}

variable "env_vars" {
  description = "Environment variables"
  type        = map(string)
  default     = {}
}

variable "secrets" {
  description = "Secrets to mount as environment variables"
  type = map(object({
    secret_id = string
    version   = string
  }))
  default = {}
}

variable "min_instances" {
  description = "Minimum number of instances (set to 1 for always-on workers)"
  type        = number
  default     = 1
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 1
}

variable "cpu_limit" {
  description = "CPU limit per instance"
  type        = string
  default     = "1"
}

variable "memory_limit" {
  description = "Memory limit per instance"
  type        = string
  default     = "512Mi"
}

variable "timeout_seconds" {
  description = "Request timeout in seconds"
  type        = number
  default     = 3600
}

variable "service_account_email" {
  description = "Service account email"
  type        = string
  default     = null
}
