#!/bin/bash
# Script to make a user an admin with verbose output

EMAIL="aslanabdulkarim84@gmail.com"
SECRET="${ADMIN_SECRET:-change-me-in-production}"

echo "========================================="
echo "Making $EMAIL an admin..."
echo "========================================="
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "http://localhost:8000/api/admin/make-admin" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$EMAIL\", \"secret\": \"$SECRET\"}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ SUCCESS: User is now an admin!"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ ERROR: User not found. Please create an account with this email first."
elif [ "$HTTP_CODE" = "403" ]; then
    echo "❌ ERROR: Invalid secret. Check ADMIN_SECRET environment variable."
else
    echo "❌ ERROR: Request failed with status $HTTP_CODE"
fi
