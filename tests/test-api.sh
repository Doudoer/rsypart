#!/bin/bash
set -e

echo "Testing G-Partes API..."
BASE_URL="http://localhost:3000/api"

# Test 1: Login
echo "1. Testing login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Login successful"

# Test 2: Create a new user (Admin only)
echo "2. Testing user creation (Admin only)..."
TIMESTAMP=$(date +%s)
USER_RESPONSE=$(curl -s -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"username\":\"vendedor$TIMESTAMP\",\"password\":\"test123\",\"role\":\"vendedor\"}")

if echo $USER_RESPONSE | grep -q "created successfully\|already exists"; then
  echo "✅ User creation successful"
else
  echo "❌ User creation failed: $USER_RESPONSE"
  exit 1
fi

# Test 3: Create a sale
echo "3. Testing sale creation..."
SALE_RESPONSE=$(curl -s -X POST $BASE_URL/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "client_nombre":"Maria Garcia",
    "client_telefono":"555-5678",
    "parte":"Alternador",
    "precio":2500.00,
    "fecha":"2024-01-20",
    "year":"2019",
    "marca":"Honda",
    "modelo":"Civic"
  }')

if echo $SALE_RESPONSE | grep -q "created successfully"; then
  echo "✅ Sale creation successful"
else
  echo "❌ Sale creation failed"
  exit 1
fi

# Test 4: Get all sales
echo "4. Testing get all sales..."
SALES=$(curl -s -X GET "$BASE_URL/sales?includeArchived=true" \
  -H "Authorization: Bearer $TOKEN")

if echo $SALES | grep -q "parte"; then
  echo "✅ Get sales successful"
else
  echo "❌ Get sales failed"
  exit 1
fi

# Test 5: Update sale status
echo "5. Testing sale status update..."
STATUS_RESPONSE=$(curl -s -X PATCH $BASE_URL/sales/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"estatus":"listo"}')

if echo $STATUS_RESPONSE | grep -q "updated successfully"; then
  echo "✅ Status update successful"
else
  echo "❌ Status update failed"
  exit 1
fi

# Test 6: Create a claim
echo "6. Testing claim creation..."
CLAIM_RESPONSE=$(curl -s -X POST $BASE_URL/claims \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sale_id":1,
    "tipo":"cambio",
    "descripcion":"Cliente solicita cambio de pieza defectuosa"
  }')

if echo $CLAIM_RESPONSE | grep -q "created successfully"; then
  echo "✅ Claim creation successful"
else
  echo "❌ Claim creation failed"
  exit 1
fi

echo ""
echo "🎉 All API tests passed!"
