"""
Authentication utilities - xác thực và định dạng các trường dữ liệu
"""
from werkzeug.security import generate_password_hash, check_password_hash
import re

# thực hiện băm mật khẩu trước khi lưu vào database
def hash_password(password: str) -> str:
    return generate_password_hash(password)

def verify_password(password_hash: str, password: str) -> bool:
    return check_password_hash(password_hash, password)

# xác thực định dạng email
def validate_email(email: str) -> bool:

    if not email:
        return False
    
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))

# xác thực định dạng mật khẩu
def validate_password(password: str):

    if not password:
        return False, "Mật khẩu không được để trống"
    
    if len(password) < 6:
        return False, "Mật khẩu phải có ít nhất 6 ký tự"
    
    if len(password) > 50:
        return False, "Mật khẩu không được vượt quá 50 ký tự"
    
    return True, ""

# xác thực định dạng số điện thoại
def validate_phone(phone: str):

    if not phone:
        return False, "Số điện thoại không được để trống"
    
    # xóa khoảng trắng và dấu -
    phone_clean = phone.replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
    
    # Định dạng số điện thoại:
    # 09xxxxxxxx, 08xxxxxxxx, 07xxxxxxxx, 05xxxxxxxx, 03xxxxxxxx
    # +849xxxxxxxx, +848xxxxxxxx, etc.
    pattern = r'^(\+84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-9])[0-9]{7}$'
    
    if not re.match(pattern, phone_clean):
        return False, "Số điện thoại không đúng định dạng (ví dụ: 0912345678 hoặc +84912345678)"
    
    return True, ""

