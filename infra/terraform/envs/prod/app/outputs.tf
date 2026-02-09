output "api_url" {
  description = "URL of the API service"
  value       = module.api.service_url
}

output "queue_worker_name" {
  description = "Name of the queue worker service"
  value       = module.queue_worker.service_name
}

output "dispatch_missing_payments_job_name" {
  description = "Name of the dispatch missing payments Cloud Run Job"
  value       = module.dispatch_missing_payments.job_name
}

output "dispatch_invoices_job_name" {
  description = "Name of the dispatch invoices Cloud Run Job"
  value       = module.dispatch_invoices.job_name
}

output "dispatch_overdue_job_name" {
  description = "Name of the dispatch overdue Cloud Run Job"
  value       = module.dispatch_overdue.job_name
}
