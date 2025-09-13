# main.py
import json
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    status,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, Field

# ---------- Configuration ----------
SECRET_KEY = os.getenv("SECRET_KEY", "super-secret-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_SECONDS = 3600

BASE_DIR = Path(__file__).parent
DB_FILE = BASE_DIR / "db" / "data.json"
BT_DB_FILE = BASE_DIR / "db" / "bluetooth.json"

# ---------- Password / JWT helpers ----------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# ---------- DB helpers ----------
def _load_db(file: Path) -> Dict:
    if not file.exists():
        return {}
    with file.open("r", encoding="utf-8") as f:
        return json.load(f)

def _write_db(file: Path, data: Dict):
    with file.open("w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# ---------- FastAPI + CORS ----------
app = FastAPI(title="Snapchat Mock + Bluetooth/Rotation Processor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # adjust in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Auth deps ----------
def decode_access_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid token")
    return payload["sub"]  # username


# ---------- Pydantic models ----------
class Token(BaseModel):
    access_token: str
    token_type: str

class FriendRequest(BaseModel):
    friend_username: str = Field(..., min_length=1)

class FriendListResponse(BaseModel):
    friends: List[str]

class BluetoothRequest(BaseModel):
    device_id: str = Field(..., min_length=1)
    server: str = Field(..., regex="^(A|B)$")  # which server is sending
    rssi: float = Field(..., description="Received signal strength (dBm, negative)")
    tx_power: float = Field(..., description="Tx power at 1 m (dBm)")
    timestamp: Optional[int] = Field(default_factory=lambda: int(time.time()))
    path_loss_exponent: Optional[float] = 2.0

class RotationRequest(BaseModel):
    device_id: str = Field(..., min_length=1)
    # Accept Euler angles (deg) or quaternion
    orientation: List[float] = Field(..., description="[x, y, z] Euler or [x, y, z, w] quaternion")
    timestamp: Optional[int] = Field(default_factory=lambda: int(time.time()))

class DeviceDataResponse(BaseModel):
    last_bluetooth: Optional[Dict] = None
    last_rotation: Optional[Dict] = None


# ---------- Existing routes (login, friends, etc.) ----------
# (unchanged – copy from the original app)
# ... (omitted for brevity) ...

# ---------- NEW ROUTES ----------
@app.post("/bluetooth", summary="Ingest Bluetooth RSSI data")
async def ingest_bluetooth(req: BluetoothRequest, _: str = Depends(get_current_user)):
    # Compute distance
    from utils import rssi_to_distance

    try:
        distance_m = rssi_to_distance(req.rssi, req.tx_power, req.path_loss_exponent)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    record = {
        "device_id": req.device_id,
        "server": req.server,
        "rssi": req.rssi,
        "tx_power": req.tx_power,
        "timestamp": req.timestamp,
        "distance_m": distance_m,
    }

    # Persist in bluetooth.json
    data = _load_db(BT_DB_FILE)
    data[req.device_id] = record
    _write_db(BT_DB_FILE, data)

    return {"msg": "Bluetooth data stored", "distance_m": distance_m}


@app.post("/rotation", summary="Ingest device rotation data")
async def ingest_rotation(req: RotationRequest, _: str = Depends(get_current_user)):
    # Basic sanity check
    if len(req.orientation) not in (3, 4):
        raise HTTPException(status_code=400, detail="orientation must be 3 (Euler) or 4 (quaternion) numbers")

    record = {
        "device_id": req.device_id,
        "orientation": req.orientation,
        "timestamp": req.timestamp,
    }

    # Persist in bluetooth.json under "rotations"
    data = _load_db(BT_DB_FILE)
    if "rotations" not in data:
        data["rotations"] = {}
    data["rotations"][req.device_id] = record
    _write_db(BT_DB_FILE, data)

    return {"msg": "Rotation data stored"}


@app.get("/data/{device_id}", response_model=DeviceDataResponse,
         summary="Get latest Bluetooth & Rotation data for a device")
async def get_device_data(device_id: str, _: str = Depends(get_current_user)):
    data = _load_db(BT_DB_FILE)

    return DeviceDataResponse(
        last_bluetooth=data.get(device_id),
        last_rotation=data.get("rotations", {}).get(device_id)
    )

# ---------- Health ----------
@app.get("/health", summary="Health check")
async def health():
    return {"status": "ok"}
