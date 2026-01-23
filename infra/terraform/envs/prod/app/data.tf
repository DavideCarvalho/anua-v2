# Reference outputs from other stacks
data "terraform_remote_state" "storage" {
  backend = "gcs"
  config = {
    bucket = "anua-v2-terraform-state"
    prefix = "prod/storage"
  }
}
