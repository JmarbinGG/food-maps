output "db_address" {
  description = "Hostname the prod app connects to."
  value       = module.database.address
}

output "instance_id" {
  description = "Prod host id, also the Session Manager target."
  value       = module.app_host.instance_id
}

output "public_ip" {
  description = "Prod Elastic IP."
  value       = module.app_host.public_ip
}
