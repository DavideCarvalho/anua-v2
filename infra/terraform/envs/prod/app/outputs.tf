output "api_url" {
  description = "URL of the API service"
  value       = module.api.service_url
}

output "queue_worker_name" {
  description = "Name of the queue worker service"
  value       = module.queue_worker.service_name
}

output "scheduler_name" {
  description = "Name of the scheduler service"
  value       = module.scheduler.service_name
}
