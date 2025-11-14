import hashlib
import secrets
import string
import binascii

def generate_random_string(length=10):
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))



def get_password_hash(password: str):
    """Генерирует хеш пароля и сохраняет соль"""
    # Генерируем случайную соль (16 символов)
    salt = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(16))
    salt_bytes = salt.encode('utf-8')
    
    # Хешируем пароль с солью
    passwd = password.encode('utf-8')
    dk = hashlib.pbkdf2_hmac('sha256', passwd, salt_bytes, 100000)
    
    # Возвращаем соль + хеш для хранения
    return salt + dk.hex()


def verify_password(password: str, stored_hash: str):
    """
    Проверяет пароль против хранимого хеша
    stored_hash должен содержать: salt + hash
    """
    try:
        # Извлекаем соль (первые 16 символов) и хеш (остальное)
        salt_str = stored_hash[:16]
        original_hash = stored_hash[16:]
        
        # Используем ту же самую соль для проверки
        salt = salt_str.encode('utf-8')
        passwd = password.encode('utf-8')
        
        # Генерируем хеш с той же самой солью
        dk = hashlib.pbkdf2_hmac('sha256', passwd, salt, 100000)
        
        # Сравниваем хеши
        return hashlib.compare_digest(dk.hex(), original_hash)
    except Exception as e:
        print(f"Error verifying password: {e}")
        return False