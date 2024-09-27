const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const app = express();
const port = 3000;

const db = new sqlite3.Database('C:/Users/warit/AppData/Roaming/DBeaverData/workspace6/.metadata/sample-database-sqlite-1/Chinook.db', (err) => {
    if (err) console.error(err.message);
    else console.log('เชื่อมต่อสำเร็จ');
});

app.use(express.json());
app.use(express.static('public'));

// เลือกจาก DailyDay
app.get('/SelectForm', (req, res) => {
    db.all(`SELECT tv.ID, tv.FirstName, tv.LastName, tv.IPosition, tv.Phone, tv.IType, tv.Cause, tv.DateTimeStart, tv.DateTimeEnd, tv.CreateDatetime, tv.StatusWorks 
            FROM TakeVacation tv WHERE tv.IsActive = 1`, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('เกิดข้อผิดพลาดภายใน');
        }
        res.json(rows);
    });
});

// อัปเดต DailyDay
app.post('/UpdateForm', (req, res) => {
    const { Id, StatusWorks } = req.body;
    if (!Id || !StatusWorks) {
        return res.status(400).send('ต้องการข้อมูลทั้งหมด');
    }
    db.run(`UPDATE TakeVacation
            SET StatusWorks=?, UpdateName='QQDEV', UpdateDatetime=DATETIME('now', '+7 hours')
            WHERE ID=?`, [StatusWorks, Id], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).send('เกิดข้อผิดพลาดภายใน');
        }
        res.status(this.changes ? 200 : 404).send(this.changes ? 'อัปเดตสำเร็จ' : 'ไม่พบบันทึกที่มี ID ที่ระบุ');
    });
});

// InsertFrom
app.post('/InsertFrom', (req, res) => {
    const { firstName, lastName, IPosition, phone, leaveType, customType, cause, start, end } = req.body;

    // ตรวจสอบว่ามีข้อมูลครบถ้วน
    if (!firstName || !IPosition || !lastName || !phone || !leaveType || !cause || !start || !end) {
        return res.status(400).send('ต้องการข้อมูลทั้งหมด');
    }

    // กำหนดประเภทการลา
    const IType = leaveType === 'other' ? customType : leaveType;

    // สร้างคำสั่ง SQL สำหรับการแทรกข้อมูล
    const sql = `
        INSERT INTO TakeVacation
        (FirstName, LastName, IPosition, Phone, IType, Cause, DateTimeStart, DateTimeEnd, CreateName, UpdateName, StatusWorks, CreateDatetime, UpdateDatetime, IsActive)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'QDev', 'QDev', 'รอพิจารณา', DATETIME('now', '+7 hours'), DATETIME('now', '+7 hours'), 1)`;

    const params = [firstName, lastName, IPosition, phone, IType, cause, start, end];

    // รันคำสั่ง SQL
    db.run(sql, params, function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).send('เกิดข้อผิดพลาดภายใน');
        }
        res.status(this.changes ? 200 : 404).send(this.changes ? 'แทรกสำเร็จ' : 'การแทรกล้มเหลว');
    });
});


// ลบจาก DailyDay (ลบแบบซอฟต์)
app.post('/DeleteForm', (req, res) => {
    const { Id } = req.body;
    if (!Id) {
        return res.status(400).send('ต้องการ ID');
    }

    db.run(`UPDATE TakeVacation SET IsActive=0, UpdateName='QQQDEV', UpdateDatetime=DATETIME('now', '+7 hours') WHERE ID=?`, [Id], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).send('เกิดข้อผิดพลาดภายใน');
        }
        res.status(this.changes ? 200 : 404).send(this.changes ? 'ลบสำเร็จ' : 'ไม่พบบันทึกที่มี ID ที่ระบุ');
    });
});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`เซิร์ฟเวอร์ทำงานที่ http://localhost:${port}`);
});
