const db = require('./src/config/db');

const users = [
  {
    email: 'admin@example.com',
    hash: '$2b$10$NN4v7Q42Bxe8ePEJVv9Qaud2GBx9PDyAdHzUe9cX30Uf6d2PsZ9l6'
  },
  {
    email: 'john@example.com',
    hash: '$2b$10$b/W8nniwczaJGzM0GBI3Qei7HJt8PWvpsIcQy4wIl50oS5pNfRvv6'
  }
];

async function main() {
  for (const user of users) {
    await db.query(
      `UPDATE users
       SET hashed_password = ?, status = 'active', email_verified = 1
       WHERE email = ?`,
      [user.hash, user.email]
    );
  }

  await db.end();
  console.log('Demo login users fixed');
  console.log('admin@example.com / admin123');
  console.log('john@example.com / user123');
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
