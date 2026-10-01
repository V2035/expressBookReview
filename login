curl -X POST http://localhost:5000/login -H "Content-Type: application/json" -d "{\"username\":\"vasavi\",\"password\":\"password123\"}"

{"message":"Login successful","token":"<JWT_TOKEN>"}