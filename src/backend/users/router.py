from fastapi import APIRouter, HTTPException, Response
import psycopg2
from authx import AuthX, AuthXConfig
from .models import UserModel, ChangeRoleRequest
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
    try:
        conn = connection_db()
        cur = conn.cursor()
        cur.execute(
            f'''
                SELECT * FROM users WHERE username='{creds.username}'
            '''
        )
        res = cur.fetchall()

        if creds.username == res[0][1] and verify_password(creds.password, res[0][2]):
            token = security.create_access_token(uid=str(res[0][0]))
            response.set_cookie(config.JWT_ACCESS_COOKIE_NAME, token)
            return {"token": token}
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    except Exception as e:
        raise HTTPException(status_code=404, detail="Not found")

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

@router.get("/check_role")
async def check_role(username: str):
    try:
        cur = connection_db().cursor()
        cur.execute(f'''
                SELECT role FROM users WHERE username='{username}'
                ''')
        return cur.fetchone()
    except:
        raise HTTPException(status_code=401, detail="Error")


@router.get("/get_users")
async def get_users():
    try:
        cur = connection_db().cursor()
        cur.execute(f'''
                SELECT id, username, role FROM users;
                ''')

        return cur.fetchall()
    except Exception as e:
        print(e)
        raise HTTPException(status_code=401, detail="Error")

@router.delete("/delete_user/{user_id}")
async def delete_user(user_id: int):
    conn = connection_db()
    conn.cursor().execute(
            f'''
                DELETE FROM users
                WHERE id={user_id};
            '''
        )
    conn.commit()
    return {"Ok": True}

def all_users():
    try:
        cur = connection_db().cursor()
        cur.execute(f'''
                SELECT id, username, role FROM users;
                ''')
        return cur.fetchall()
    except Exception as e:
        return 0

def find_user_by_id(user_id: int):
    for user in all_users():
        if user[0] == user_id:
            return user
    return None

def find_user_index_by_id(user_id: int):
    for i, user in enumerate(all_users()):
        if user[0] == user_id:
            return i
    return -1

@router.put("/change_role")
async def change_role(request: ChangeRoleRequest):
    conn = connection_db()
    conn.cursor().execute(
            f'''
                UPDATE users
                SET role = '{request.new_role}'
                WHERE id={request.id};
            '''
        )
    conn.commit()
    return {"Ok": True}