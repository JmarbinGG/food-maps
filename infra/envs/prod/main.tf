# Only the secret itself; its value is set outside Terraform and never
# enters state.
resource "aws_secretsmanager_secret" "env" {
  name = "prod/env"
}

module "app_host" {
  source = "../../modules/app_host"

  name                       = "foodmaps-prod"
  environment                = "prod"
  instance_type              = "t3.medium"
  ami_id                     = "ami-088b93445e67b2ab1"
  vpc_id                     = data.aws_vpc.default.id
  subnet_id                  = data.aws_subnet.app.id
  secret_arn                 = aws_secretsmanager_secret.env.arn
  security_group_description = "Production instance with the container stack"

  ssh_cidrs = ["212.88.98.191/32"]
}

module "database" {
  source = "../../modules/database"

  identifier            = "foodmaps-prod"
  instance_class        = "db.t4g.micro"
  engine_version        = "8.4.8"
  allocated_storage     = 20
  max_allocated_storage = 1000
  parameter_group_name  = "default.mysql8.4-db-q527ew3i33hhfvgqtxndtive6u-upgrade"
  db_subnet_group_name  = "default-vpc-015713dcbc56bdfe2"
  backup_window         = "07:07-07:37"
  maintenance_window    = "wed:08:49-wed:09:19"
  copy_tags_to_snapshot = true
  monitoring_interval   = 60
  monitoring_role_arn   = data.aws_iam_role.rds_monitoring.arn

  # Private, and reachable only from the prod app host through the
  # database's own foodmaps-prod-db group.
  vpc_id                = data.aws_vpc.default.id
  app_security_group_id = module.app_host.security_group_id
}
