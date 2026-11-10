# A MySQL RDS instance. The master password is managed outside Terraform and
# never set here, so it stays out of state.
resource "aws_db_instance" "this" {
  identifier     = var.identifier
  engine         = "mysql"
  engine_version = var.engine_version
  instance_class = var.instance_class
  username       = var.username

  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = var.storage_type
  storage_encrypted     = true

  db_subnet_group_name   = var.db_subnet_group_name
  vpc_security_group_ids = var.vpc_security_group_ids
  publicly_accessible    = var.publicly_accessible
  parameter_group_name   = var.parameter_group_name

  copy_tags_to_snapshot    = var.copy_tags_to_snapshot
  backup_retention_period  = var.backup_retention_period
  backup_window            = var.backup_window
  maintenance_window       = var.maintenance_window
  delete_automated_backups = var.delete_automated_backups
  deletion_protection      = var.deletion_protection
  skip_final_snapshot      = var.skip_final_snapshot

  # Used only if the instance is ever deleted. Must not already exist.
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.identifier}-final"

  monitoring_interval = var.monitoring_interval
  monitoring_role_arn = var.monitoring_role_arn

  lifecycle {
    # Terraform refuses any plan that would delete this database. Removing
    # it on purpose means deleting this line in a reviewed change first.
    prevent_destroy = true
  }
}
