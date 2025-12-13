// Email validation regex
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Phone validation regex (Vietnamese format)
const phoneRegex = /^(\+84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-9])[0-9]{7}$/;

// Toggle password visibility
document.getElementById('togglePassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('password');
    const icon = this.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

document.getElementById('toggleConfirmPassword').addEventListener('click', function() {
    const passwordInput = document.getElementById('confirm_password');
    const icon = this.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

// Validate email
function validateEmail(email) {
    if (!email) {
        return { valid: false, message: 'Email không được để trống' };
    }
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Email không đúng định dạng' };
    }
    return { valid: true, message: '' };
}

// Validate phone
function validatePhone(phone) {
    if (!phone) {
        return { valid: false, message: 'Số điện thoại không được để trống' };
    }
    const cleanPhone = phone.replace(/\s|-|\(|\)/g, '');
    if (!phoneRegex.test(cleanPhone)) {
        return { valid: false, message: 'Số điện thoại không đúng định dạng (vd: 0912345678 hoặc +84912345678)' };
    }
    return { valid: true, message: '' };
}

// Validate password
function validatePassword(password) {
    if (!password) {
        return { valid: false, message: 'Mật khẩu không được để trống' };
    }
    if (password.length < 6) {
        return { valid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
    }
    if (password.length > 50) {
        return { valid: false, message: 'Mật khẩu không được vượt quá 50 ký tự' };
    }
    return { valid: true, message: '' };
}

// Check password strength
function checkPasswordStrength(password) {
    if (!password) return { strength: 'none', text: '', width: '0%' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    
    if (strength <= 2) {
        return { strength: 'weak', text: 'Mật khẩu yếu', width: '33%', class: 'strength-weak' };
    } else if (strength <= 3) {
        return { strength: 'medium', text: 'Mật khẩu trung bình', width: '66%', class: 'strength-medium' };
    } else {
        return { strength: 'strong', text: 'Mật khẩu mạnh', width: '100%', class: 'strength-strong' };
    }
}

// Update password strength indicator
document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    const strength = checkPasswordStrength(password);
    const fill = document.getElementById('strengthFill');
    const text = document.getElementById('strengthText');
    
    if (password) {
        fill.style.width = strength.width;
        fill.className = 'strength-fill ' + strength.class;
        text.textContent = strength.text;
    } else {
        fill.style.width = '0%';
        fill.className = 'strength-fill';
        text.textContent = '';
    }
});

// Real-time validation
document.getElementById('email').addEventListener('blur', function() {
    const result = validateEmail(this.value);
    if (result.valid) {
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
        document.getElementById('email-error').textContent = '';
    } else {
        this.classList.remove('is-valid');
        this.classList.add('is-invalid');
        document.getElementById('email-error').textContent = result.message;
    }
});

document.getElementById('phone').addEventListener('blur', function() {
    const result = validatePhone(this.value);
    if (result.valid) {
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
        document.getElementById('phone-error').textContent = '';
    } else {
        this.classList.remove('is-valid');
        this.classList.add('is-invalid');
        document.getElementById('phone-error').textContent = result.message;
    }
});

document.getElementById('password').addEventListener('blur', function() {
    const result = validatePassword(this.value);
    if (result.valid) {
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
        document.getElementById('password-error').textContent = '';
    } else {
        this.classList.remove('is-valid');
        this.classList.add('is-invalid');
        document.getElementById('password-error').textContent = result.message;
    }
});

document.getElementById('confirm_password').addEventListener('blur', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    
    if (!confirmPassword) {
        this.classList.remove('is-valid');
        this.classList.add('is-invalid');
        document.getElementById('confirm-password-error').textContent = 'Vui lòng xác nhận mật khẩu';
    } else if (password !== confirmPassword) {
        this.classList.remove('is-valid');
        this.classList.add('is-invalid');
        document.getElementById('confirm-password-error').textContent = 'Mật khẩu xác nhận không khớp';
    } else {
        this.classList.remove('is-invalid');
        this.classList.add('is-valid');
        document.getElementById('confirm-password-error').textContent = '';
    }
});

// Form submission validation
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    
    let isValid = true;
    
    // Validate username
    if (!username) {
        document.getElementById('username').classList.add('is-invalid');
        document.getElementById('username-error').textContent = 'Tên đăng nhập không được để trống';
        isValid = false;
    } else {
        document.getElementById('username').classList.remove('is-invalid');
        document.getElementById('username-error').textContent = '';
    }
    
    // Validate email
    const emailResult = validateEmail(email);
    if (!emailResult.valid) {
        document.getElementById('email').classList.add('is-invalid');
        document.getElementById('email-error').textContent = emailResult.message;
        isValid = false;
    } else {
        document.getElementById('email').classList.remove('is-invalid');
        document.getElementById('email-error').textContent = '';
    }
    
    // Validate phone
    const phoneResult = validatePhone(phone);
    if (!phoneResult.valid) {
        document.getElementById('phone').classList.add('is-invalid');
        document.getElementById('phone-error').textContent = phoneResult.message;
        isValid = false;
    } else {
        document.getElementById('phone').classList.remove('is-invalid');
        document.getElementById('phone-error').textContent = '';
    }
    
    // Validate password
    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) {
        document.getElementById('password').classList.add('is-invalid');
        document.getElementById('password-error').textContent = passwordResult.message;
        isValid = false;
    } else {
        document.getElementById('password').classList.remove('is-invalid');
        document.getElementById('password-error').textContent = '';
    }
    
    // Validate confirm password
    if (!confirmPassword) {
        document.getElementById('confirm_password').classList.add('is-invalid');
        document.getElementById('confirm-password-error').textContent = 'Vui lòng xác nhận mật khẩu';
        isValid = false;
    } else if (password !== confirmPassword) {
        document.getElementById('confirm_password').classList.add('is-invalid');
        document.getElementById('confirm-password-error').textContent = 'Mật khẩu xác nhận không khớp';
        isValid = false;
    } else {
        document.getElementById('confirm_password').classList.remove('is-invalid');
        document.getElementById('confirm-password-error').textContent = '';
    }
    
    if (isValid) {
        this.submit();
    } else {
        // Scroll to first error
        const firstError = this.querySelector('.is-invalid');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
        }
    }
});