from fastapi import APIRouter, HTTPException, Response
import psycopg2
from authx import AuthX, AuthXConfig
from backend.config import setings
from models import UserLoginModel

router = APIRouter(
    prefix="/user"
)

config = AuthXConfig()
config.JWT_SECRET_KEY = "goida"
config.JWT_ACCESS_COOKIE_NAME = "my_token"
config.JWT_TOKEN_LOCATION = ["cookies"]

security = AuthX(config=config)

@router.post("/login")
async def login(creds: UserLoginModel, response: Response):
    if creds.username == "test" and creds.password == "test":
        token = await security.create_access_token(uid="123")
        await response.set_cookie(config.JWT_ACCESS_COOKIE_NAME, token)
        return {"token": token}
    raise HTTPException(status_code=401, detail="Incorrect username or password")

@router.post("/register")
async def register():
    ...