from fastapi import APIRouter, HTTPException, Response
import psycopg2
from authx import AuthX, AuthXConfig
from .models import UserModel
from .auth import get_password_hash, verify_password

def connection_db():
    conn = psycopg2.connect(
    dbname="myapp",
    user="user",
    password="pass",
    host="localhost",
    port="5432"
    )

    return conn

router = APIRouter(
    prefix="/user"
)



config = AuthXConfig()
config.JWT_SECRET_KEY = "test"
config.JWT_ACCESS_COOKIE_NAME = "my_token"
config.JWT_TOKEN_LOCATION = ["cookies"]

security = AuthX(config=config)

@router.post("/login")
async def login(creds: UserModel, response: Response):
    conn = connection_db()
    cur = conn.cursor()
    cur.execute(
        f'''
            SELECT * FROM users WHERE username='{creds.username}'
        '''
    )
    res = cur.fetchall()
    print(res)
    print(res[0][2])
    print(get_password_hash(creds.password))
    if creds.username == res[0][1] and verify_password(creds.password, res[0][2]):
        token = await security.create_access_token(uid=res[0][0])
        await response.set_cookie(config.JWT_ACCESS_COOKIE_NAME, token)
        return {"token": token}
    raise HTTPException(status_code=401, detail="Incorrect username or password")

@router.post("/register")
async def register(creds: UserModel):
    try:
        hashed_pass = get_password_hash(creds.password)
        conn = connection_db()
        cur = conn.cursor()
        cur.execute(
            f'''
            SELECT username FROM users WHERE username='{creds.username}'
            '''
        )
        if not(cur.fetchone()):
            conn.cursor().execute(
            f'''
            INSERT INTO users (username, password) VALUES
                ('{creds.username}','{hashed_pass}');
            '''
            )
            conn.commit()
            return {"Ok": True}
        else:
            raise HTTPException(status_code=401, detail="User exists")
    except Exception as e:
        return HTTPException(status_code=401, detail="UserExists")