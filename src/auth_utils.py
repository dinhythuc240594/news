"""
Authentication utilities - Password hashing and validation
"""
from werkzeug.security import generate_password_hash, check_password_hash
import re


def hash_password(password: str) -> str:
    """
    Hash password using Werkzeug
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password string
    """
    return generate_password_hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    """
    Verify password against hash
    
    Args:
        password_hash: Hashed password from database
        password: Plain text password to verify
        
    Returns:
        True if password matches, False otherwise
    """
    return check_password_hash(password_hash, password)


def validate_email(email: str) -> bool:
    """
    Validate email format
    
    Args:
        email: Email string to validate
        
    Returns:
        True if valid email format, False otherwise
    """
    if not email:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password: str):
    """
    Validate password strength
    
    Args:
        password: Password string to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not password:
        return False, "Mật khẩu không được để trống"
    
    if len(password) < 6:
        return False, "Mật khẩu phải có ít nhất 6 ký tự"
    
    if len(password) > 50:
        return False, "Mật khẩu không được vượt quá 50 ký tự"
    
    return True, ""


def validate_phone(phone: str):
    """
    Validate Vietnamese phone number format
    
    Args:
        phone: Phone number string to validate
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not phone:
        return False, "Số điện thoại không được để trống"
    
    # Remove spaces and dashes
    phone_clean = phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
    
    # Vietnamese phone number patterns:
    # 09xxxxxxxx, 08xxxxxxxx, 07xxxxxxxx, 05xxxxxxxx, 03xxxxxxxx
    # +849xxxxxxxx, +848xxxxxxxx, etc.
    pattern = r'^(\+84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-9])[0-9]{7}$'
    
    if not re.match(pattern, phone_clean):
        return False, "Số điện thoại không đúng định dạng (ví dụ: 0912345678 hoặc +84912345678)"
    
    return True, ""

