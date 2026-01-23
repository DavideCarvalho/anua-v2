#!/bin/bash
set -e

# This script migrates existing Terraform state to the new multi-stack structure

PROJECT_ID="anua-480822"
REGION="southamerica-east1"

echo "=== Terraform State Migration ==="
echo ""

# Foundation stack
echo ">>> Initializing and importing Foundation stack..."
cd "$(dirname "$0")/../envs/prod/foundation"
terraform init

echo "Importing APIs..."
terraform import 'google_project_service.required_apis["run.googleapis.com"]' "$PROJECT_ID/run.googleapis.com" || true
terraform import 'google_project_service.required_apis["artifactregistry.googleapis.com"]' "$PROJECT_ID/artifactregistry.googleapis.com" || true
terraform import 'google_project_service.required_apis["secretmanager.googleapis.com"]' "$PROJECT_ID/secretmanager.googleapis.com" || true
terraform import 'google_project_service.required_apis["iamcredentials.googleapis.com"]' "$PROJECT_ID/iamcredentials.googleapis.com" || true

echo "Importing Artifact Registry..."
terraform import google_artifact_registry_repository.docker_repo "projects/$PROJECT_ID/locations/$REGION/repositories/anua-v2-docker" || true

echo "Importing Workload Identity Pool..."
terraform import google_iam_workload_identity_pool.github_pool "projects/$PROJECT_ID/locations/global/workloadIdentityPools/github-pool" || true
terraform import google_iam_workload_identity_pool_provider.github_provider "projects/$PROJECT_ID/locations/global/workloadIdentityPools/github-pool/providers/github-provider" || true

echo "Importing GitHub Actions service account..."
terraform import google_service_account.github_actions "projects/$PROJECT_ID/serviceAccounts/github-actions-deployer@$PROJECT_ID.iam.gserviceaccount.com" || true

echo "Importing IAM roles..."
terraform import 'google_project_iam_member.github_actions_roles["roles/artifactregistry.writer"]' "$PROJECT_ID roles/artifactregistry.writer serviceAccount:github-actions-deployer@$PROJECT_ID.iam.gserviceaccount.com" || true
terraform import 'google_project_iam_member.github_actions_roles["roles/run.admin"]' "$PROJECT_ID roles/run.admin serviceAccount:github-actions-deployer@$PROJECT_ID.iam.gserviceaccount.com" || true
terraform import 'google_project_iam_member.github_actions_roles["roles/iam.serviceAccountUser"]' "$PROJECT_ID roles/iam.serviceAccountUser serviceAccount:github-actions-deployer@$PROJECT_ID.iam.gserviceaccount.com" || true
terraform import 'google_project_iam_member.github_actions_roles["roles/storage.admin"]' "$PROJECT_ID roles/storage.admin serviceAccount:github-actions-deployer@$PROJECT_ID.iam.gserviceaccount.com" || true

echo "Importing Workload Identity binding..."
terraform import google_service_account_iam_member.github_actions_workload_identity "projects/$PROJECT_ID/serviceAccounts/github-actions-deployer@$PROJECT_ID.iam.gserviceaccount.com roles/iam.workloadIdentityUser principalSet://iam.googleapis.com/projects/362335271526/locations/global/workloadIdentityPools/github-pool/attribute.repository/DavideCarvalho/anua-v2" || true

echo ""
echo ">>> Foundation stack done!"
echo ""

# Storage stack
echo ">>> Initializing and importing Storage stack..."
cd "../storage"
terraform init

echo "Importing GCS bucket..."
terraform import google_storage_bucket.uploads "$PROJECT_ID-uploads" || true

echo "Importing bucket IAM..."
terraform import google_storage_bucket_iam_member.uploads_public_read "b/$PROJECT_ID-uploads roles/storage.objectViewer allUsers" || true
terraform import google_storage_bucket_iam_member.uploads_cloud_run_write "b/$PROJECT_ID-uploads roles/storage.objectAdmin serviceAccount:362335271526-compute@developer.gserviceaccount.com" || true

echo "Importing secrets..."
terraform import google_secret_manager_secret.app_key "projects/$PROJECT_ID/secrets/production-anua-v2-app-key" || true
terraform import google_secret_manager_secret.db_password "projects/$PROJECT_ID/secrets/production-anua-v2-db-password" || true
terraform import google_secret_manager_secret.smtp_password "projects/$PROJECT_ID/secrets/production-anua-v2-smtp-password" || true

echo "Importing secret versions..."
terraform import google_secret_manager_secret_version.app_key "projects/362335271526/secrets/production-anua-v2-app-key/versions/2" || true
terraform import google_secret_manager_secret_version.db_password "projects/362335271526/secrets/production-anua-v2-db-password/versions/2" || true
terraform import google_secret_manager_secret_version.smtp_password "projects/362335271526/secrets/production-anua-v2-smtp-password/versions/2" || true

echo "Importing secret IAM..."
terraform import google_secret_manager_secret_iam_member.app_key_access "projects/$PROJECT_ID/secrets/production-anua-v2-app-key roles/secretmanager.secretAccessor serviceAccount:362335271526-compute@developer.gserviceaccount.com" || true
terraform import google_secret_manager_secret_iam_member.db_password_access "projects/$PROJECT_ID/secrets/production-anua-v2-db-password roles/secretmanager.secretAccessor serviceAccount:362335271526-compute@developer.gserviceaccount.com" || true
terraform import google_secret_manager_secret_iam_member.smtp_password_access "projects/$PROJECT_ID/secrets/production-anua-v2-smtp-password roles/secretmanager.secretAccessor serviceAccount:362335271526-compute@developer.gserviceaccount.com" || true

echo ""
echo ">>> Storage stack done!"
echo ""

# App stack
echo ">>> Initializing and importing App stack..."
cd "../app"
terraform init

echo "Importing Cloud Run service..."
terraform import module.api.google_cloud_run_v2_service.service "projects/$PROJECT_ID/locations/$REGION/services/production-anua-v2-api" || true
terraform import 'module.api.google_cloud_run_v2_service_iam_member.public_access[0]' "projects/$PROJECT_ID/locations/$REGION/services/production-anua-v2-api roles/run.invoker allUsers" || true

echo "Importing Cloud Run job..."
terraform import module.migrate.google_cloud_run_v2_job.job "projects/$PROJECT_ID/locations/$REGION/jobs/production-anua-v2-migrate" || true

echo ""
echo ">>> App stack done!"
echo ""

echo "=== Migration complete! ==="
echo ""
echo "Next steps:"
echo "1. Run 'terraform plan' in each stack to verify no changes"
echo "2. If everything looks good, delete the _legacy folder"
echo "3. Update CI/CD to use the new stack structure"
