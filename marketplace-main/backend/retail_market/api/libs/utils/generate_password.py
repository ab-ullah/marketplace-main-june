import secrets
import string


def generate_secure_password():
    pwd_length = 14
    letters = string.ascii_letters
    digits = string.digits
    special_chars = string.punctuation
    alphabet = letters + digits + special_chars

    password = ''
    for __ in range(pwd_length):
        password += ''.join(secrets.choice(alphabet))

    return password
