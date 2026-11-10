variable "ami_id" {
  type        = string
  description = "AMI the instance was launched from. Ignored after creation; see lifecycle in main.tf."
}

variable "environment" {
  type        = string
  description = "Environment name (staging or prod), used in names and tags."
}

variable "instance_type" {
  type        = string
  description = "EC2 instance type."
}

variable "name" {
  type        = string
  description = "Base name for the host's resources, such as foodmaps-staging."
}

variable "root_volume_encrypted" {
  type        = bool
  description = "Whether the root volume is encrypted. Changing it replaces the instance."
  default     = false
}

variable "root_volume_size" {
  type        = number
  description = "Root volume size in GiB."
  default     = 20
}

variable "secret_arn" {
  type        = string
  description = "Secrets Manager secret the app reads its environment from."
}

variable "security_group_description" {
  type        = string
  description = "Security group description. AWS can't change it in place, so it replaces the group."
}

variable "ssh_cidrs" {
  type        = set(string)
  description = "CIDRs allowed to SSH in. Empty means Session Manager only."
  default     = []
}

variable "subnet_id" {
  type        = string
  description = "Subnet the instance runs in."
}

variable "user_data" {
  type        = string
  description = "First-boot script. Ignored after creation; see lifecycle in main.tf."
  default     = null
}

variable "vpc_id" {
  type        = string
  description = "VPC for the security group."
}
