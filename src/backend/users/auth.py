import hashlib

def get_password_hash(password: str) -> str:
    """
    Хеширует пароль без использования соли
    Использует SHA-256
    """
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(password: str, hashed_password: str) -> bool:
    """
    Проверяет пароль без соли
    """
    return get_password_hash(password) == hashed_password