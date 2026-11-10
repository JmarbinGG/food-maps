terraform {
  required_version = "~> 1.11"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # The bucket was first created with local state (it can't hold its own state
  # before it exists), then migrated here with `terraform init -migrate-state`.
  backend "s3" {
    bucket       = "foodmaps-tfstate-062315167468"
    key          = "bootstrap/terraform.tfstate"
    region       = "us-west-1"
    encrypt      = true
    use_lockfile = true
  }
}
