# Adopts the staging resources that were created by hand. Once applied these
# are no-ops and can be deleted.

import {
  to = aws_secretsmanager_secret.env
  id = "arn:aws:secretsmanager:us-west-1:062315167468:secret:staging/env-7KiBTw"
}

import {
  to = module.app_host.aws_iam_role.this
  id = "foodmaps-staging-role"
}

import {
  to = module.app_host.aws_iam_role_policy_attachment.ssm
  id = "foodmaps-staging-role/arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

import {
  to = module.app_host.aws_iam_role_policy.secrets_read
  id = "foodmaps-staging-role:staging-secrets-read"
}

import {
  to = module.app_host.aws_iam_instance_profile.this
  id = "foodmaps-staging-profile"
}

import {
  to = module.app_host.aws_security_group.this
  id = "sg-0cda0ce126f085b4b"
}

import {
  to = module.app_host.aws_vpc_security_group_ingress_rule.http
  id = "sgr-0a9ff56031282f7b3"
}

import {
  to = module.app_host.aws_vpc_security_group_ingress_rule.https
  id = "sgr-0d9923284f1fddf0a"
}

import {
  to = module.app_host.aws_vpc_security_group_ingress_rule.ssh["41.210.144.216/32"]
  id = "sgr-064559d85986a23c0"
}

import {
  to = module.app_host.aws_vpc_security_group_ingress_rule.ssh["99.155.36.252/32"]
  id = "sgr-00eb26213f1e90708"
}

import {
  to = module.app_host.aws_vpc_security_group_ingress_rule.ssh["212.88.98.191/32"]
  id = "sgr-07f6588aaedce49db"
}

import {
  to = module.app_host.aws_vpc_security_group_egress_rule.all
  id = "sgr-0cef3656c71e7ea29"
}

import {
  to = module.app_host.aws_instance.this
  id = "i-010a11ba074605bac"
}

import {
  to = module.app_host.aws_eip.this
  id = "eipalloc-0e209e074aa04ae58"
}

import {
  to = module.app_host.aws_eip_association.this
  id = "eipassoc-06296bdaa05adcd76"
}

import {
  to = module.database.aws_db_instance.this
  id = "foodmaps-staging"
}

import {
  to = aws_vpc_security_group_ingress_rule.db_from_app
  id = "sgr-0a374836d9e058da2"
}
