# Credentials come from the environment (AWS_PROFILE=foodmaps-sso locally).
provider "aws" {
  region              = "us-west-1"
  allowed_account_ids = ["062315167468"]

  # Applied to every resource this stack manages. ManagedBy tells anyone in
  # the console that hand edits will be reverted or flagged as drift.
  default_tags {
    tags = {
      Project     = "food-maps"
      Environment = "staging"
      ManagedBy   = "terraform"
    }
  }
}
