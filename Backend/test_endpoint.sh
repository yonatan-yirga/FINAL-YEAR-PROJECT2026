#!/bin/bash
# Test the advisor students endpoint
# Usage: bash test_endpoint.sh

echo "Testing advisor students endpoint..."
echo ""

# Get auth token first (you'll need to update with valid credentials)
echo "1. Getting auth token..."
TOKEN=$(curl -s -X POST http://localhost:8000/api/accounts/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"depthead@cs.test.com","password":"test1234"}' \
  | grep -o '"access":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "ERROR: Failed to get auth token"
  exit 1
fi

echo "Token obtained: ${TOKEN:0:20}..."
echo ""

# Get list of advisors
echo "2. Getting advisors list..."
ADVISORS=$(curl -s -X GET http://localhost:8000/api/departments/advisors/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Advisors response:"
echo "$ADVISORS" | python3 -m json.tool 2>/dev/null || echo "$ADVISORS"
echo ""

# Extract first advisor ID
ADVISOR_ID=$(echo "$ADVISORS" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)

if [ -z "$ADVISOR_ID" ]; then
  echo "ERROR: No advisor ID found"
  exit 1
fi

echo "Testing with advisor ID: $ADVISOR_ID"
echo ""

# Test the advisor students endpoint
echo "3. Getting advisor students..."
curl -v -X GET "http://localhost:8000/api/departments/advisors/$ADVISOR_ID/students/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

echo ""
echo "Test complete!"
