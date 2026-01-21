output "connection_name" {
  description = "Cloud SQL connection name"
  value       = google_sql_database_instance.postgres.connection_name
}

output "connection_string" {
  description = "Database connection string (Unix socket for Cloud SQL Proxy)"
  value       = "postgresql://${google_sql_user.user.name}:${urlencode(random_password.db_password.result)}@/${google_sql_database.database.name}?host=/cloudsql/${google_sql_database_instance.postgres.connection_name}"
  sensitive   = true
}

output "connection_string_vpc" {
  description = "Database connection string (VPC private IP)"
  value       = "postgresql://${google_sql_user.user.name}:${urlencode(random_password.db_password.result)}@${google_sql_database_instance.postgres.private_ip_address}:5432/${google_sql_database.database.name}?sslmode=disable"
  sensitive   = true
}

output "instance_name" {
  description = "Cloud SQL instance name"
  value       = google_sql_database_instance.postgres.name
}

output "database_name" {
  description = "Database name"
  value       = google_sql_database.database.name
}

output "private_ip" {
  description = "Private IP address"
  value       = google_sql_database_instance.postgres.private_ip_address
}

output "public_ip" {
  description = "Public IP address (if enabled)"
  value       = var.enable_public_ip ? google_sql_database_instance.postgres.public_ip_address : null
}

output "connection_string_public" {
  description = "Database connection string (Public IP)"
  value       = var.enable_public_ip ? "postgresql://${google_sql_user.user.name}:${urlencode(random_password.db_password.result)}@${google_sql_database_instance.postgres.public_ip_address}:5432/${google_sql_database.database.name}?sslmode=disable" : null
  sensitive   = true
}

output "db_password" {
  description = "Database password"
  value       = random_password.db_password.result
  sensitive   = true
}
