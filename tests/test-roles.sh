#!/bin/bash
set -e

echo "Testing Role-Based Access Control..."
BASE_URL="http://localhost:3000/api"

# Login as vendedor
echo "1. Login as vendedor..."
VENDEDOR_LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"vendedor1","password":"test123"}')
VENDEDOR_TOKEN=$(echo $VENDEDOR_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$VENDEDOR_TOKEN" ]; then
  echo "❌ Vendedor login failed"
  exit 1
fi
echo "✅ Vendedor login successful"

# Test vendedor can create sales
echo "2. Test vendedor can create sales..."
SALE_RESPONSE=$(curl -s -X POST $BASE_URL/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VENDEDOR_TOKEN" \
  -d '{
    "client_nombre":"Pedro Lopez",
    "client_telefono":"555-9999",
    "parte":"Bateria",
    "precio":1200.00,
    "fecha":"2024-01-25"
  }')

if echo $SALE_RESPONSE | grep -q "created successfully"; then
  echo "✅ Vendedor can create sales"
else
  echo "❌ Vendedor cannot create sales"
  exit 1
fi

# Test vendedor CANNOT create users
echo "3. Test vendedor CANNOT create users..."
USER_RESPONSE=$(curl -s -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VENDEDOR_TOKEN" \
  -d '{"username":"test","password":"test","role":"vendedor"}')

if echo $USER_RESPONSE | grep -q "Insufficient permissions"; then
  echo "✅ Vendedor correctly blocked from creating users"
else
  echo "❌ Role restriction failed"
  exit 1
fi

# Test vendedor CANNOT update sale status
echo "4. Test vendedor CANNOT update sale status..."
STATUS_RESPONSE=$(curl -s -X PATCH $BASE_URL/sales/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VENDEDOR_TOKEN" \
  -d '{"estatus":"entregado"}')

if echo $STATUS_RESPONSE | grep -q "Insufficient permissions"; then
  echo "✅ Vendedor correctly blocked from updating status"
else
  echo "❌ Role restriction failed"
  exit 1
fi

echo ""
echo "🎉 All role-based access control tests passed!"
