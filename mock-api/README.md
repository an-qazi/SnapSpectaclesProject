

Build and run Docker:

docker build -t snapchat-mock .
docker run -p 8000:8000 -v "$(pwd)/db:/app/db" -e SECRET_KEY="your‑secret" snapchat-mock


## DOCS:
# Start server
uvicorn main:app --reload

# Log in to get a token
curl -X POST http://localhost:8000/token \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=alice&password=alicepassword"

# Send Bluetooth data
curl -X POST http://localhost:8000/bluetooth \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"device_id":"devA","server":"A","rssi":-65,"tx_power":-59}'

# Send Rotation data
curl -X POST http://localhost:8000/rotation \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"device_id":"devA","orientation":[0,90,180]}'

# Fetch latest data
curl http://localhost:8000/data/devA -H "Authorization: Bearer <token>"