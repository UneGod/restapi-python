from pydantic import BaseModel

class UserModel(BaseModel):
    username: str
    password: str

class ChangeRoleRequest(BaseModel):
    id: int
    new_role: str