#!/bin/bash
dnf install -y docker git
systemctl enable --now docker
usermod -aG docker ec2-user
