# Reference outputs from other stacks
data "terraform_remote_state" "storage" {
  backend = "gcs"
  config = {
    bucket = "anua-v2-terraform-state"
    prefix = "prod/storage"
  }
}

data "google_secret_manager_secret_version" "discord_alert_webhook" {
  secret  = data.terraform_remote_state.storage.outputs.discord_alert_webhook_secret_id
  version = "latest"
}
