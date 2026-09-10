const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let v = match[2] || '';
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
      process.env[match[1]] = v.trim();
    }
  });
}

async function initDb() {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'madarasa_db',
    });

    console.log('Connected to MySQL madarasa_db for initialization...');

    // 1. Create subjects table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id VARCHAR(50) PRIMARY KEY,
        subjectName VARCHAR(255) NOT NULL,
        subjectCode VARCHAR(100) NOT NULL,
        description TEXT
      );
    `);

    // 2. Ensure initial subjects exist if empty
    const [subRows] = await pool.query('SELECT COUNT(*) as count FROM subjects;');
    if (subRows[0].count === 0) {
      await pool.query(`
        INSERT INTO subjects (id, subjectName, subjectCode, description) VALUES
        ('SUB-101', 'English', 'ENG-101', 'Core English reading & grammar course'),
        ('SUB-102', 'Arabic', 'ARA-101', 'Arabic grammar, literature and speaking'),
        ('SUB-103', 'Biology', 'BIO-101', 'Introduction to cellular biology and genetics'),
        ('SUB-104', 'Chemistry', 'CHM-101', 'General chemistry, bonding and atomic structure'),
        ('SUB-105', 'Physics', 'PHY-101', 'Mechanics, kinematics and light properties'),
        ('SUB-106', 'Mathematics', 'MTH-101', 'Calculus, equations and statistical methods'),
        ('SUB-107', 'Islamic Studies', 'ISL-101', 'Islamic history, jurisprudence and Quran studies'),
        ('SUB-108', 'Geography', 'GEO-101', 'Physical geography and human civilizations'),
        ('SUB-109', 'History', 'HIS-101', 'Global world history and ancient eras');
      `);
      console.log('Seeded initial subjects.');
    }

    // 3. Ensure initial admin user exists in users table
    const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = "admin" OR role = "super_admin";');
    if (userRows[0].count === 0) {
      await pool.query(`
        INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'super_admin');
      `);
      console.log('Seeded default admin user.');
    }

    // 4. Ensure initial class exists if empty
    const [clsRows] = await pool.query('SELECT COUNT(*) as count FROM classes;');
    if (clsRows[0].count === 0) {
      await pool.query(`
        INSERT INTO classes (id, name, room, instructor) VALUES
        ('cls-1', 'Class One', 'Room 101', 'Prof. Ahmed Ali'),
        ('cls-2', 'Class Two', 'Room 102', 'Dr. Fatima Omar');
      `);
      console.log('Seeded initial classes.');
    }

    console.log('Database initialization complete!');
    await pool.end();
  } catch (err) {
    console.error('Initialization error:', err);
  }
}

initDb();
