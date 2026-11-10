# Prod runs in the account's default VPC. It is looked up, not managed.
data "aws_vpc" "default" {
  default = true
}

data "aws_subnet" "app" {
  vpc_id            = data.aws_vpc.default.id
  availability_zone = "us-west-1a"
  default_for_az    = true
}

# The VPC's default security group. The prod database is still attached to
# it, which also lets the staging host reach prod's MySQL port.
data "aws_security_group" "vpc_default" {
  vpc_id = data.aws_vpc.default.id
  name   = "default"
}

# Enhanced monitoring role, shared and created by the RDS console.
data "aws_iam_role" "rds_monitoring" {
  name = "rds-monitoring-role"
}
