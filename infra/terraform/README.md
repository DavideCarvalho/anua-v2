# Terraform Infrastructure

This directory contains the Terraform configuration for the Anuá project infrastructure.

## Structure

```
terraform/
├── modules/                    # Reusable modules
│   ├── cloud-run/             # Cloud Run service module
│   ├── cloud-run-job/         # Cloud Run job module
│   └── database/              # Database module (if needed)
└── envs/
    └── prod/
        ├── foundation/        # APIs, Artifact Registry, Workload Identity
        ├── storage/           # GCS bucket, Secret Manager
        └── app/               # Cloud Run API, Migration job
```

## Stacks

Each stack has its own state file to reduce blast radius:

### foundation/
Resources that rarely change:
- GCP APIs enablement
- Artifact Registry
- Workload Identity Pool for GitHub Actions
- GitHub Actions service account and IAM roles

### storage/
Stateful resources:
- GCS bucket for uploads
- Secret Manager secrets

### app/
Application resources that change frequently:
- Cloud Run API service
- Cloud Run migration job

## Usage

### Prerequisites
1. Install Terraform >= 1.0
2. Authenticate with GCP: `gcloud auth application-default login`
3. Create a `terraform.tfvars` file in each stack directory (see examples below)

### terraform.tfvars examples

**storage/terraform.tfvars:**
```hcl
project_id    = "anua-480822"
environment   = "production"
app_key       = "your-app-key"
db_password   = "your-db-password"
smtp_password = "your-smtp-password"
```

**app/terraform.tfvars:**
```hcl
project_id  = "anua-480822"
environment = "production"
app_key     = "your-app-key"
db_password = "your-db-password"
```

### Deploy Order

Apply stacks in this order:
1. `foundation/` - Base infrastructure
2. `storage/` - Storage and secrets
3. `app/` - Application services

```bash
# Foundation
cd envs/prod/foundation
terraform init
terraform apply

# Storage
cd ../storage
terraform init
terraform apply

# App
cd ../app
terraform init
terraform apply
```

### Updating a single stack

To update only the app (most common operation):

```bash
cd envs/prod/app
terraform apply
```

This won't affect storage or foundation resources.

## State Migration

If you need to migrate from the old single-state setup:

1. Export existing state for each resource
2. Import into the new stack's state
3. Remove from old state

Example:
```bash
# In the new foundation/ directory
terraform import google_artifact_registry_repository.docker_repo projects/anua-480822/locations/southamerica-east1/repositories/anua-v2-docker
```
