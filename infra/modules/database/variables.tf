variable "allocated_storage" {
  type        = number
  description = "Storage in GiB."
}

variable "backup_retention_period" {
  type        = number
  description = "Days of automated backups to keep."
  default     = 7
}

variable "backup_window" {
  type        = string
  description = "Daily backup window, UTC."
}

variable "copy_tags_to_snapshot" {
  type        = bool
  description = "Whether the instance's tags are copied onto its snapshots."
  default     = false
}

variable "db_subnet_group_name" {
  type        = string
  description = "DB subnet group the instance lives in."
}

variable "delete_automated_backups" {
  type        = bool
  description = "Whether automated backups are deleted along with the instance."
  default     = false
}

variable "deletion_protection" {
  type        = bool
  description = "Whether AWS refuses to delete the instance."
  default     = true
}

variable "engine_version" {
  type        = string
  description = "MySQL engine version."
}

variable "identifier" {
  type        = string
  description = "RDS instance identifier. Renaming changes the endpoint hostname."
}

variable "instance_class" {
  type        = string
  description = "RDS instance class."
}

variable "maintenance_window" {
  type        = string
  description = "Weekly maintenance window, UTC."
}

variable "max_allocated_storage" {
  type        = number
  description = "Storage autoscaling ceiling in GiB; 0 turns autoscaling off."
  default     = 0
}

variable "monitoring_interval" {
  type        = number
  description = "Enhanced monitoring interval in seconds; 0 turns it off."
  default     = 0
}

variable "monitoring_role_arn" {
  type        = string
  description = "IAM role for enhanced monitoring. Required when monitoring_interval > 0."
  default     = null
}

variable "parameter_group_name" {
  type        = string
  description = "DB parameter group."
}

variable "publicly_accessible" {
  type        = bool
  description = "Whether the instance gets a public address."
  default     = false
}

variable "skip_final_snapshot" {
  type        = bool
  description = "Whether deleting the instance skips the final snapshot."
  default     = false
}

variable "storage_type" {
  type        = string
  description = "Storage type, such as gp2 or gp3."
  default     = "gp2"
}

variable "username" {
  type        = string
  description = "Master username. Changing it replaces the instance."
  default     = "admin"
}

variable "vpc_security_group_ids" {
  type        = list(string)
  description = "Security groups attached to the instance."
}
