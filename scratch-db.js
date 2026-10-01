const mysql = require('mysql2/promise');

const passwords = [
  '', 'root', 'admin', 'password', '123456', '12345678', 'Root1234!', 'Root1234',
  'Admin123!', 'Admin123', 'MySQL123!', 'MySQL123', 'Admin@123', 'Root@123',
  'Madarasa123!', 'Madarasa@123', 'madarasa', 'madarasa123', 'P@ssword1', 'P@ssword123',
  'password123', 'rootpass', 'sayyid', 'sayyidd4real', 'sayyidd4real-prog', '1234',
  '12345', '123456789', 'qwerty', 'Pass1234!', 'Password123!', 'mysql', 'mysql123!'
];

async function checkDb() {
  for (const password of passwords) {
    try {
      const conn = await mysql.createConnection({
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: password,
      });
      console.log(`SUCCESS! Connected on port 3307 with password "${password}"!`);
      const [dbs] = await conn.query('SHOW DATABASES');
      console.log('Databases:', dbs.map(d => d.Database));
      await conn.end();
      return;
    } catch (err) {
      if (err.code !== 'ER_ACCESS_DENIED_ERROR') {
        console.log(`Pass "${password}": ${err.code} - ${err.message}`);
      }
    }
  }
  console.log("No password matched.");
}

checkDb();
