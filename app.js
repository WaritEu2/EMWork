require('dotenv').config(); // โหลดค่าจาก .env

const mysql = require('mysql2');
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// ตรวจสอบไฟล์ CA (ถ้าใช้ SSL)
let sslOptions = {};
if (process.env.DB_SSL_CA_PATH) {
    const caPath = path.join(__dirname, process.env.DB_SSL_CA_PATH);
    if (!fs.existsSync(caPath)) {
        console.error('ไม่พบไฟล์ CA certificate:', caPath);
        process.exit(1);
    }
    sslOptions.ssl = { ca: fs.readFileSync(caPath) };
}

// สร้าง connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    ...sslOptions
});

app.use(express.json());
app.use(express.static('public'));

// ดึงข้อมูล
app.get('/SelectForm', (req, res) => {
    pool.query(
        `SELECT ID, FirstName, LastName, IPosition, Phone, IType, Cause, 
                DateTimeStart, DateTimeEnd, CreateDatetime, StatusWorks 
         FROM TakeVacation WHERE IsActive = 1`,
        (err, results) => {
            if (err) return res.status(500).send('เกิดข้อผิดพลาด');
            res.json(results);
        }
    );
});

// เพิ่มข้อมูล
app.post('/InsertFrom', (req, res) => {
    const { firstName, lastName, IPosition, phone, leaveType, customType, cause, start, end } = req.body;
    if (!firstName || !IPosition || !lastName || !phone || !leaveType || !cause || !start || !end) {
        return res.status(400).send('ต้องการข้อมูลทั้งหมด');
    }

    const IType = leaveType === 'other' ? customType : leaveType;
    const sql = `INSERT INTO TakeVacation 
        (FirstName, LastName, IPosition, Phone, IType, Cause, DateTimeStart, DateTimeEnd, 
        CreateName, UpdateName, StatusWorks, CreateDatetime, UpdateDatetime, IsActive) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'QDev', 'QDev', 'รอพิจารณา', NOW(), NOW(), 1)`;
    const params = [firstName, lastName, IPosition, phone, IType, cause, start, end];

    pool.query(sql, params, (err, result) => {
        if (err) return res.status(500).send('เกิดข้อผิดพลาด');
        res.status(result.affectedRows ? 200 : 404).send('แทรกสำเร็จ');
    });
});

// อัปเดตสถานะ
app.post('/UpdateForm', (req, res) => {
    const { Id, StatusWorks } = req.body;
    if (!Id || !StatusWorks) return res.status(400).send('ต้องการข้อมูลทั้งหมด');

    pool.query(
        `UPDATE TakeVacation SET StatusWorks=?, UpdateName='QQDEV', UpdateDatetime=NOW() WHERE ID=?`,
        [StatusWorks, Id],
        (err, result) => {
            if (err) return res.status(500).send('เกิดข้อผิดพลาด');
            res.status(result.affectedRows ? 200 : 404).send('อัปเดตสำเร็จ');
        }
    );
});

// ลบแบบ soft delete
app.post('/DeleteForm', (req, res) => {
    const { Id } = req.body;
    if (!Id) return res.status(400).send('ต้องการ ID');

    pool.query(
        `UPDATE TakeVacation SET IsActive=0, UpdateName='QQQDEV', UpdateDatetime=NOW() WHERE ID=?`,
        [Id],
        (err, result) => {
            if (err) return res.status(500).send('เกิดข้อผิดพลาด');
            res.status(result.affectedRows ? 200 : 404).send('ลบสำเร็จ');
        }
    );
});

// เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`เซิร์ฟเวอร์ทำงานที่ http://localhost:${port}`);
});
