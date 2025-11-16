import hashlib
import secrets
import string

def hash_password_basic(password: str, salt: str = None) -> tuple:
    """
    Хеширует пароль с использованием SHA-256 и соли
    Возвращает хеш и соль
    """
    if salt is None:
        # Генерируем случайную соль
        salt = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(16))
    
    # Создаем хеш
    password_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000  # Количество итераций
    )
    
    return password_hash.hex(), salt

def verify_password_basic(password: str, password_hash: str, salt: str) -> bool:
    """
    Проверяет пароль по хешу и соли
    """
    new_hash, _ = hash_password_basic(password, salt)
    return new_hash == password_hash

# Пример использования
if __name__ == "__main__":
    password = "my_secure_password"
    
    # Хешируем пароль
    hashed, salt = hash_password_basic(password)
    print(f"Хеш: {hashed}")
    print(f"Соль: {salt}")
    
    # Проверяем пароль
    is_valid = verify_password_basic(password, hashed, salt)
    print(f"Пароль верен: {is_valid}")