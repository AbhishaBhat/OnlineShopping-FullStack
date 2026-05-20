-- Fix demo login accounts with real bcrypt hashes.
-- Admin login: admin@example.com / admin123
-- User login:  john@example.com / user123

UPDATE users
SET hashed_password = '$2b$10$NN4v7Q42Bxe8ePEJVv9Qaud2GBx9PDyAdHzUe9cX30Uf6d2PsZ9l6',
    status = 'active',
    email_verified = 1
WHERE email = 'admin@example.com';

UPDATE users
SET hashed_password = '$2b$10$b/W8nniwczaJGzM0GBI3Qei7HJt8PWvpsIcQy4wIl50oS5pNfRvv6',
    status = 'active',
    email_verified = 1
WHERE email = 'john@example.com';
