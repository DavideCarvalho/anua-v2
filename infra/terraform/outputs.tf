output "api_url" {
  description = "URL of the API Cloud Run service"
  value       = module.api.service_url
}

output "docker_registry" {
  description = "Docker registry URL"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}"
}

output "api_image_url" {
  description = "Full URL for API image"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.docker_repo.repository_id}/api"
}

output "github_actions_service_account" {
  description = "Service account email for GitHub Actions"
  value       = google_service_account.github_actions.email
}

output "workload_identity_provider" {
  description = "Workload Identity Provider for GitHub Actions"
  value       = google_iam_workload_identity_pool_provider.github_provider.name
}
