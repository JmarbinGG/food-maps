output "instance_id" {
  description = "EC2 instance id, also the Session Manager target."
  value       = aws_instance.this.id
}

output "public_ip" {
  description = "Elastic IP that DNS points at."
  value       = aws_eip.this.public_ip
}

output "role_name" {
  description = "Instance role name."
  value       = aws_iam_role.this.name
}

output "security_group_id" {
  description = "Security group attached to the host."
  value       = aws_security_group.this.id
}
