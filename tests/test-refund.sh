#!/bin/bash
set -e

echo "Testing Automatic Refund Workflow..."
BASE_URL="http://localhost:3000/api"

# Login as admin
ADMIN_LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Create a claim of type 'reembolso' for sale ID 2
echo "1. Creating a refund claim..."
CLAIM_RESPONSE=$(curl -s -X POST $BASE_URL/claims \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "sale_id":2,
    "tipo":"reembolso",
    "descripcion":"Cliente solicita reembolso"
  }')
CLAIM_ID=$(echo $CLAIM_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)
echo "✅ Refund claim created with ID: $CLAIM_ID"

# Check sale status before resolving claim
echo "2. Checking sale status before resolving claim..."
SALE_BEFORE=$(curl -s -X GET "$BASE_URL/sales/2" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
STATUS_BEFORE=$(echo $SALE_BEFORE | grep -o '"estatus":"[^"]*' | cut -d'"' -f4)
echo "   Sale status: $STATUS_BEFORE"

# Resolve the claim
echo "3. Resolving the refund claim..."
curl -s -X PATCH "$BASE_URL/claims/$CLAIM_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"estatus":"resuelto"}' > /dev/null

# Wait a moment for the update to propagate
sleep 1

# Check sale status after resolving claim
echo "4. Checking sale status after resolving claim..."
SALE_AFTER=$(curl -s -X GET "$BASE_URL/sales/2" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
STATUS_AFTER=$(echo $SALE_AFTER | grep -o '"estatus":"[^"]*' | cut -d'"' -f4)
echo "   Sale status: $STATUS_AFTER"

if [ "$STATUS_AFTER" = "reembolsado" ]; then
  echo "✅ Sale status automatically updated to 'reembolsado'"
else
  echo "❌ Sale status not updated correctly"
  exit 1
fi

echo ""
echo "🎉 Automatic refund workflow test passed!"
