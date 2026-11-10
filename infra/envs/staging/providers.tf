# Credentials come from the environment (AWS_PROFILE=foodmaps-sso locally).
provider "aws" {
  region              = "us-west-1"
  allowed_account_ids = ["062315167468"]
}
