#!/bin/bash
set -e

echo "Testing Archived Sales Filter..."
BASE_URL="http://localhost:3000/api"

# Login as admin
ADMIN_LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
ADMIN_TOKEN=$(echo $ADMIN_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Update a sale to 'entregado' (archived status)
echo "1. Updating sale to 'entregado' (archived)..."
curl -s -X PATCH $BASE_URL/sales/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{"estatus":"entregado"}' > /dev/null
echo "✅ Sale updated to archived status"

# Get sales without archived
echo "2. Getting sales without archived filter..."
SALES_NO_ARCHIVED=$(curl -s -X GET "$BASE_URL/sales" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
NO_ARCHIVED_COUNT=$(echo $SALES_NO_ARCHIVED | grep -o '"id":' | wc -l)
echo "   Found $NO_ARCHIVED_COUNT sales (should exclude archived)"

# Get sales with archived
echo "3. Getting sales WITH archived filter..."
SALES_WITH_ARCHIVED=$(curl -s -X GET "$BASE_URL/sales?includeArchived=true" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
WITH_ARCHIVED_COUNT=$(echo $SALES_WITH_ARCHIVED | grep -o '"id":' | wc -l)
echo "   Found $WITH_ARCHIVED_COUNT sales (should include all)"

if [ $WITH_ARCHIVED_COUNT -gt $NO_ARCHIVED_COUNT ]; then
  echo "✅ Archived filter working correctly"
else
  echo "❌ Archived filter not working"
  exit 1
fi

echo ""
echo "🎉 Archived sales filter test passed!"
