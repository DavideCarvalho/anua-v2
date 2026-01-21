variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "job_name" {
  description = "Cloud Run Job name"
  type        = string
}

variable "image" {
  description = "Container image URL"
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

variable "env_vars" {
  description = "Environment variables"
  type        = map(string)
  default     = {}
}

variable "secrets" {
  description = "Secret environment variables"
  type = map(object({
    secret_id = string
    version   = string
  }))
  default = {}
}

variable "vpc_connector" {
  description = "VPC connector ID"
  type        = string
  default     = null
}

variable "service_account" {
  description = "Service account email"
  type        = string
  default     = ""
}

variable "timeout" {
  description = "Job timeout"
  type        = string
  default     = "600s"
}

variable "max_retries" {
  description = "Maximum number of retries"
  type        = number
  default     = 0
}

variable "cpu_limit" {
  description = "CPU limit"
  type        = string
  default     = "1000m"
}

variable "memory_limit" {
  description = "Memory limit"
  type        = string
  default     = "512Mi"
}
