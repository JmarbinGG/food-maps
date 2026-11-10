output "address" {
  description = "Hostname the app connects to."
  value       = aws_db_instance.this.address
}

output "identifier" {
  description = "RDS instance identifier."
  value       = aws_db_instance.this.identifier
}
