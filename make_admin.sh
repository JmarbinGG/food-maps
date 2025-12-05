#!/bin/bash
# Script to make a user an admin
# Usage: ./make_admin.sh

EMAIL="aslanabdulkarim84@gmail.com"
SECRET="${ADMIN_SECRET:-change-me-in-production}"

curl -X POST "http://localhost:8000/api/admin/make-admin" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"secret\": \"$SECRET\"}"

echo ""
