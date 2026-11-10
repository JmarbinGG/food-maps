# Only the secret itself; its value is set outside Terraform and never
# enters state.
resource "aws_secretsmanager_secret" "env" {
  name = "staging/env"
}

module "app_host" {
  source = "../../modules/app_host"

  name          = "foodmaps-staging"
  environment   = "staging"
  instance_type = "t3.medium"
  ami_id        = "ami-0de449e6d2e49c030"
  user_data     = file("${path.module}/user_data.sh")
  vpc_id        = data.aws_vpc.default.id
  subnet_id     = data.aws_subnet.app.id
  secret_arn    = aws_secretsmanager_secret.env.arn
  # No SSH: shell access goes through Session Manager (aws ssm start-session).
  security_group_description = "Food Maps staging: public 80/443, no SSH ingress (SSM only)"
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

  # MySQL is reachable only from the staging app host, through the
  # database's own foodmaps-staging-db group.
  vpc_id                = data.aws_vpc.default.id
  app_security_group_id = module.app_host.security_group_id
}
