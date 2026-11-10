output "address" {
  description = "Hostname the app connects to."
  value       = aws_db_instance.this.address
}

output "security_group_id" {
  description = "The database's own security group, when the module manages one."
  value       = one(aws_security_group.this[*].id)
}

output "identifier" {
  description = "RDS instance identifier."
  value       = aws_db_instance.this.identifier
}
