variable "account_id" {
  type        = string
  description = "AWS account that owns the Food Maps infrastructure."
  default     = "062315167468"
}

variable "noncurrent_version_retention_days" {
  type        = number
  description = "How long superseded state versions are kept for recovery."
  default     = 90
}

variable "region" {
  type        = string
  description = "AWS region for the state bucket."
  default     = "us-west-1"
}
