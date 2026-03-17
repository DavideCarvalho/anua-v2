locals {
  discord_alert_notification_channels = concat(
    var.alert_notification_channel_ids,
    [google_monitoring_notification_channel.discord_sql_alerts.name]
  )
}

resource "google_logging_metric" "cloud_run_service_error_count" {
  name        = "cloud_run_service_error_count"
  description = "Count Cloud Run API/worker error logs"
  filter      = <<-EOT
resource.type="cloud_run_revision"
resource.labels.service_name=~"production-anua-v2-api|production-anua-v2-queue-worker"
severity>=ERROR
EOT

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"
  }
}

resource "google_logging_metric" "cloud_run_job_error_count" {
  name        = "cloud_run_job_error_count"
  description = "Count Cloud Run Job error logs"
  filter      = <<-EOT
resource.type="cloud_run_job"
severity>=ERROR
EOT

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"
  }
}

resource "google_monitoring_alert_policy" "cloud_run_service_errors" {
  display_name          = "anua-v2 cloud run service errors"
  combiner              = "OR"
  notification_channels = local.discord_alert_notification_channels

  conditions {
    display_name = "cloud run service errors > 0"

    condition_threshold {
      filter          = "metric.type=\"logging.googleapis.com/user/cloud_run_service_error_count\" resource.type=\"cloud_run_revision\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0

      trigger {
        count = 1
      }

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_SUM"
      }
    }
  }

  alert_strategy {
    auto_close = "1800s"
  }

  documentation {
    mime_type = "text/markdown"
    content   = "Cloud Run API/worker errors detected. Check Cloud Logging and PostHog traces."
  }

  enabled = true
}

resource "google_monitoring_alert_policy" "cloud_run_job_errors" {
  display_name          = "anua-v2 cloud run job errors"
  combiner              = "OR"
  notification_channels = local.discord_alert_notification_channels

  conditions {
    display_name = "cloud run job errors > 0"

    condition_threshold {
      filter          = "metric.type=\"logging.googleapis.com/user/cloud_run_job_error_count\" resource.type=\"cloud_run_job\""
      duration        = "300s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0

      trigger {
        count = 1
      }

      aggregations {
        alignment_period   = "300s"
        per_series_aligner = "ALIGN_SUM"
      }
    }
  }

  alert_strategy {
    auto_close = "1800s"
  }

  documentation {
    mime_type = "text/markdown"
    content   = "Cloud Run Job errors detected. Check job logs and PostHog events."
  }

  enabled = true
}

resource "google_logging_metric" "cloudsql_prod_risky_changes" {
  name        = "cloudsql_prod_risky_changes"
  description = "Count risky Cloud SQL admin actions and destructive SQL patterns in prod"
  filter      = <<-EOT
resource.type="cloudsql_database"
resource.labels.database_id="prod-school-super-app-postgres-95d21e81"
(
  protoPayload.methodName="cloudsql.instances.restoreBackup"
  OR protoPayload.methodName="cloudsql.instances.import"
  OR protoPayload.methodName="cloudsql.instances.delete"
  OR protoPayload.methodName="cloudsql.instances.clone"
  OR protoPayload.methodName="cloudsql.instances.update"
  OR textPayload:("DROP TABLE" OR "DROP DATABASE" OR "TRUNCATE")
)
EOT

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"
  }
}

resource "google_monitoring_alert_policy" "cloudsql_prod_risky_changes" {
  display_name          = "[PROD] Cloud SQL risky change detected"
  combiner              = "OR"
  notification_channels = local.discord_alert_notification_channels

  conditions {
    display_name = "cloud sql risky changes > 0"

    condition_threshold {
      filter          = "metric.type=\"logging.googleapis.com/user/cloudsql_prod_risky_changes\" resource.type=\"cloudsql_database\""
      duration        = "0s"
      comparison      = "COMPARISON_GT"
      threshold_value = 0

      trigger {
        count = 1
      }

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_SUM"
      }
    }
  }

  alert_strategy {
    auto_close = "1800s"
  }

  documentation {
    mime_type = "text/markdown"
    content   = "Risco detectado na Cloud SQL prod: restore/import/delete/update de instancia ou SQL destrutivo (DROP/TRUNCATE)."
  }

  enabled = true
}

resource "google_monitoring_notification_channel" "discord_sql_alerts" {
  display_name = "Discord - Cloud SQL Prod Alerts"
  type         = "webhook_basicauth"

  labels = {
    url      = trimspace(data.google_secret_manager_secret_version.discord_alert_webhook.secret_data)
    username = "x"
  }

  sensitive_labels {
    password = "x"
  }
}
