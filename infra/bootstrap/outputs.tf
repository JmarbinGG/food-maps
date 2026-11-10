output "state_bucket" {
  description = "Bucket name to use in every stack's S3 backend block."
  value       = aws_s3_bucket.tfstate.bucket
}
