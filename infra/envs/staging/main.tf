# Only the secret itself; its value is set outside Terraform and never
# enters state.
resource "aws_secretsmanager_secret" "env" {
  name = "staging/env"
}

module "app_host" {
  source = "../../modules/app_host"

  name                       = "foodmaps-staging"
  environment                = "staging"
  instance_type              = "t3.medium"
  ami_id                     = "ami-0de449e6d2e49c030"
  user_data                  = file("${path.module}/user_data.sh")
  vpc_id                     = data.aws_vpc.default.id
  subnet_id                  = data.aws_subnet.app.id
  secret_arn                 = aws_secretsmanager_secret.env.arn
  security_group_description = "Food Maps staging: public 80/443, no SSH ingress (SSM only)"

  ssh_cidrs = [
    "41.210.144.216/32",
    "99.155.36.252/32",
    "212.88.98.191/32",
  ]
}

module "database" {
  source = "../../modules/database"

  identifier           = "foodmaps-staging"
  instance_class       = "db.t3.micro"
  engine_version       = "8.4.11"
  allocated_storage    = 20
  parameter_group_name = "default.mysql8.4"
  db_subnet_group_name = "default"
  backup_window        = "07:07-07:37"
  maintenance_window   = "wed:08:49-wed:09:19"

  vpc_security_group_ids = [data.aws_security_group.vpc_default.id]
}

# The app reaches MySQL through the VPC default group, which is shared and
# not managed here. Only this one rule on it belongs to staging.
resource "aws_vpc_security_group_ingress_rule" "db_from_app" {
  security_group_id            = data.aws_security_group.vpc_default.id
  ip_protocol                  = "tcp"
  from_port                    = 3306
  to_port                      = 3306
  referenced_security_group_id = module.app_host.security_group_id
}
