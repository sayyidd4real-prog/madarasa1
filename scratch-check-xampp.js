const mysql = require('mysql2/promise');

async function checkFks() {
  const conn = await mysql.createConnection({ host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'madarasa_db' });
  const [fks] = await conn.query(`
    SELECT 
      TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
    FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'madarasa_db' AND REFERENCED_TABLE_NAME IS NOT NULL
  `);
  console.log('Foreign Keys:', JSON.stringify(fks, null, 2));

  const [promoCreate] = await conn.query('SHOW CREATE TABLE promotions');
  console.log('promotions schema:\n', promoCreate[0]['Create Table']);

  const [studentsCreate] = await conn.query('SHOW CREATE TABLE students');
  console.log('students schema:\n', studentsCreate[0]['Create Table']);

  await conn.end();
}

checkFks();
