output "uploads_bucket_name" {
  description = "Name of the uploads bucket"
  value       = google_storage_bucket.uploads.name
}

output "uploads_bucket_url" {
  description = "URL of the uploads bucket"
  value       = "gs://${google_storage_bucket.uploads.name}"
}

output "app_key_secret_id" {
  description = "Secret ID for APP_KEY"
  value       = google_secret_manager_secret.app_key.secret_id
}

output "db_password_secret_id" {
  description = "Secret ID for DB_PASSWORD"
  value       = google_secret_manager_secret.db_password.secret_id
}

output "smtp_password_secret_id" {
  description = "Secret ID for SMTP_PASSWORD"
  value       = google_secret_manager_secret.smtp_password.secret_id
}
