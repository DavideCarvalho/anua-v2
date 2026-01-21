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

variable "network_id" {
  description = "VPC network ID"
  type        = string
}

variable "tier" {
  description = "Cloud SQL tier"
  type        = string
  default     = "db-f1-micro"
}

variable "availability_type" {
  description = "Availability type (ZONAL or REGIONAL)"
  type        = string
  default     = "ZONAL"
}

variable "disk_size" {
  description = "Disk size in GB"
  type        = number
  default     = 10
}

variable "database_name" {
  description = "Database name"
  type        = string
  default     = "anua_v2"
}

variable "database_user" {
  description = "Database user"
  type        = string
  default     = "app_user"
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = false
}

variable "point_in_time_recovery_enabled" {
  description = "Enable Point-in-Time Recovery (PITR)"
  type        = bool
  default     = false
}

variable "transaction_log_retention_days" {
  description = "Number of days to retain transaction logs"
  type        = number
  default     = 7
}

variable "backup_retention_count" {
  description = "Number of automated backups to retain"
  type        = number
  default     = 7
}

variable "enable_public_ip" {
  description = "Enable public IP for the database instance"
  type        = bool
  default     = false
}

variable "authorized_networks" {
  description = "List of authorized networks for public IP access"
  type = list(object({
    name = string
    cidr = string
  }))
  default = []
}
