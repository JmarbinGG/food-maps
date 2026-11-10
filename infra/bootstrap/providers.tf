# Credentials come from the environment (AWS_PROFILE=foodmaps-sso locally),
# so the same code runs from CI with a different identity.
provider "aws" {
  region = var.region

  # Refuse to run against any other account, whatever profile is active.
  allowed_account_ids = [var.account_id]

  default_tags {
    tags = {
      Project   = "food-maps"
      ManagedBy = "terraform"
      Stack     = "bootstrap"
    }
  }
}
