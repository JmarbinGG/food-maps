# Staging runs in the account's default VPC. It is looked up, not managed:
# Terraform owning the default VPC brings risk and no benefit.
data "aws_vpc" "default" {
  default = true
}

data "aws_subnet" "app" {
  vpc_id            = data.aws_vpc.default.id
  availability_zone = "us-west-1a"
  default_for_az    = true
}

# The VPC's default security group, which staging's database is attached to.
data "aws_security_group" "vpc_default" {
  vpc_id = data.aws_vpc.default.id
  name   = "default"
}
