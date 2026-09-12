import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

// Read environment variables from .env.local if available
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let v = match[2] || "";
      if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
      if (v.startsWith("'") && v.endsWith("'")) v = v.slice(1, -1);
      if (!process.env[match[1]]) {
        process.env[match[1]] = v.trim();
      }
    }
  });
}

// Global MySQL connection pool instance (lazy singleton)
let poolInstance: mysql.Pool | null = null;

function getPool(): mysql.Pool {
  if (poolInstance) {
    return poolInstance;
  }

  const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    poolInstance = mysql.createPool(dbUrl);
    return poolInstance;
  }

  if (isProduction) {
    throw new Error(
      "DATABASE_URL environment variable is missing in production environment. " +
      "Please set DATABASE_URL in Vercel environment variables with your Railway MySQL connection string."
    );
  }

  // Local development fallback only
  poolInstance = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "madarasa_db",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  return poolInstance;
}

export async function queryDb<T = any>(sql: string, params: any[] = []): Promise<[T, any]> {
  const p = getPool();
  return p.query(sql, params) as Promise<[T, any]>;
}

let isInitialized = false;

export async function initMysqlDb() {
  if (isInitialized) return;
  try {
    const p = getPool();

    // 1. Ensure subjects table exists
    await p.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id VARCHAR(50) PRIMARY KEY,
        subjectName VARCHAR(255) NOT NULL,
        subjectCode VARCHAR(100) NOT NULL,
        description TEXT
      );
    `);

    // 2. Ensure classes table exists
    await p.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        room VARCHAR(100) NOT NULL,
        instructor VARCHAR(255) NOT NULL
      );
    `);

    // 3. Ensure students table exists
    await p.query(`
      CREATE TABLE IF NOT EXISTS students (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        grade VARCHAR(50) NOT NULL
      );
    `);

    // 4. Ensure users table exists
    await p.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        student_id VARCHAR(50) NULL
      );
    `);

    // 5. Ensure exams table exists
    await p.query(`
      CREATE TABLE IF NOT EXISTS exams (
        id VARCHAR(50) PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        class_id VARCHAR(50) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        term VARCHAR(50) NOT NULL,
        score INT NOT NULL DEFAULT 0,
        feedback TEXT,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
      );
    `);

    // 6. Ensure fees table exists
    await p.query(`
      CREATE TABLE IF NOT EXISTS fees (
        id VARCHAR(50) PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        deductions DECIMAL(10,2) NOT NULL DEFAULT 0.00,
        status VARCHAR(50) NOT NULL DEFAULT 'unpaid',
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      );
    `);

    // Seed default admin user if empty
    const [uRows] = await p.query("SELECT COUNT(*) AS count FROM users WHERE role IN ('admin', 'super_admin');");
    if ((uRows as any[])[0].count === 0) {
      await p.query(
        "INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'super_admin');"
      );
    }

    isInitialized = true;
  } catch (err) {
    console.error("MySQL initDb error:", err);
    throw err;
  }
}

// Default export proxy delegating to lazy pool instance
const poolProxy = new Proxy({} as mysql.Pool, {
  get(_target, prop) {
    const p = getPool();
    const val = (p as any)[prop];
    if (typeof val === "function") {
      return val.bind(p);
    }
    return val;
  },
});

export default poolProxy;

