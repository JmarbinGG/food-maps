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
  publicly_accessible   = true
  monitoring_interval   = 60
  monitoring_role_arn   = data.aws_iam_role.rds_monitoring.arn

  vpc_security_group_ids = [
    data.aws_security_group.vpc_default.id,
    aws_security_group.db_access.id,
    aws_security_group.db_legacy_access.id,
  ]
}

# Lets the prod host reach MySQL. Created by the RDS console when the
# database was still called foodapitest; AWS can't change a group's
# description in place, so the old wording stays.
resource "aws_security_group" "db_access" {
  name        = "rds-ec2-1"
  description = "Security group attached to foodapitest to allow EC2 instances with specific security groups attached to connect to the database. Modification could lead to connection loss."
  vpc_id      = data.aws_vpc.default.id

  tags = {
    Name = "foodapitest-db-access"
  }
}

resource "aws_vpc_security_group_ingress_rule" "db_from_app" {
  security_group_id            = aws_security_group.db_access.id
  ip_protocol                  = "tcp"
  from_port                    = 3306
  to_port                      = 3306
  referenced_security_group_id = module.app_host.security_group_id
}

# Holds the outside-IP MySQL rule. Managed only so it can be removed.
resource "aws_security_group" "db_legacy_access" {
  name        = "rds-ec2-2"
  description = "Security group attached to foodapitest to allow EC2 instances with specific security groups attached to connect to the database. Modification could lead to connection loss."
  vpc_id      = data.aws_vpc.default.id
}

resource "aws_vpc_security_group_ingress_rule" "db_from_outside_ip" {
  security_group_id = aws_security_group.db_legacy_access.id
  ip_protocol       = "tcp"
  from_port         = 3306
  to_port           = 3306
  cidr_ipv4         = "212.88.98.61/32"
}
