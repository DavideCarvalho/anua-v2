terraform {
  backend "gcs" {
    bucket = "anua-v2-terraform-state"
    prefix = "prod/app"
  }
}
