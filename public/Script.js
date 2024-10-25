let currentId = null;

// ฟังก์ชันเปิด Popup และรับ ID ของเรกคอร์ดที่จะอัปเดต

// ฟังก์ชันสำหรับซ่อน Popup
function hidePopup() {
    document.getElementById('popup').style.display = 'none'; // ซ่อน Popup
    document.getElementById('overlay').style.display = 'none'; // ซ่อนพื้นหลังมืด
}

// ฟังก์ชันสำหรับส่งสถานะไปยังเซิร์ฟเวอร์
function updateRecord() {
    const statusWorks = document.getElementById('statusWorksDropdown').value; // ดึงค่าสถานะที่ผู้ใช้เลือก

    if (statusWorks && currentId) {
        const data = {
            Id: currentId,
            StatusWorks: statusWorks
        }; // เตรียมข้อมูลที่จะส่ง

        fetch('/UpdateForm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data) // ส่งข้อมูลในรูปแบบ JSON
            })
            .then(response => {
                if (response.ok) {
                    // ใช้ SweetAlert สำหรับการอัปเดตสำเร็จ
                    Swal.fire({
                        icon: 'success',
                        title: 'อัปเดตสำเร็จ',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    hidePopup(); // ซ่อน Popup เมื่ออัปเดตสำเร็จ
                    loadTable(); // รีเฟรชตารางข้อมูล
                } else {
                    // ใช้ SweetAlert สำหรับการอัปเดตไม่สำเร็จ
                    Swal.fire({
                        icon: 'error',
                        title: 'ไม่พบบันทึกที่มี ID ที่ระบุ'
                    });
                }
            })
            .catch(error => {
                console.error('Error updating record:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด',
                    text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
                });
            });
    }
}

function loadTable() {
    fetch('/SelectForm')
        .then(response => response.json())
        .then(data => {
            const table = document.getElementById('PersonTable');
            table.innerHTML =
                `<tr>
                    <th>ID</th>
                    <th>ชื่อ</th>
                    <th>นามสกุล</th>
                    <th>ตำแหน่ง</th>
                    <th>เบอร์โทรศัพท์</th>
                    <th>ประเภทการลา</th>
                    <th>สาเหตุการลา</th>
                    <th>วันเริ่มต้น</th>
                    <th>วันสิ้นสุด</th>
                    <th>สถานะ</th>
                    <th>แก้ไข</th>
                    <th>ลบ</th>
                </tr>`;

            data.forEach(row => {
                const tr = document.createElement('tr');
                
                // Conditionally show the "แก้ไข" button based on the value of StatusWorks
                let editButton = '';
                if (row.StatusWorks === 'รอพิจารณา') {
                    editButton = `<button onclick="openPopup(${row.ID})">แก้ไข</button>`;
                }

                tr.innerHTML =
                    `<td>${row.ID}</td>
                    <td>${row.FirstName}</td>
                    <td>${row.LastName}</td>
                    <td>${row.IPosition}</td>
                    <td>${row.Phone}</td>
                    <td>${row.IType}</td>
                    <td>${row.Cause}</td>
                    <td>${row.DateTimeStart}</td>
                    <td>${row.DateTimeEnd}</td>
                    <td>${row.StatusWorks}</td>
                    <td>${editButton}</td>
                    <td><button style="background-color: red;" onclick="deleteRecord(${row.ID})">ลบ</button></td>`;

                table.appendChild(tr);
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}


// ฟังก์ชันใหม่เพื่อเปิด Popup
function openPopup(id) {
    currentId = id; // เก็บ ID ของเรกคอร์ดที่ต้องการอัปเดต
    document.getElementById('popup').style.display = 'block'; // แสดง Popup
    document.getElementById('overlay').style.display = 'block'; // แสดงพื้นหลังมืด
}

function insertRecord() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const IPosition = document.getElementById('IPosition').value;
    const phone = document.getElementById('phone').value;
    const leaveType = document.getElementById('leaveType').value;
    const customType = document.getElementById('customType').value;
    const cause = document.getElementById('cause').value;
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;

    // Validate the leave request
    if (!validateLeaveRequest(start, end, leaveType)) {
        return; // Stop if validation fails
    }

    const IType = leaveType === 'other' ? customType : leaveType;

    const data = {
        firstName,
        lastName,
        IPosition,
        phone,
        leaveType: IType,
        customType,
        cause,
        start,
        end
    };

    fetch('/InsertFrom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                // ใช้ SweetAlert เพื่อแจ้งเตือนการบันทึกสำเร็จ
                Swal.fire({
                    icon: 'success',
                    title: 'บันทึกสำเร็จ',
                    showConfirmButton: false,
                    timer: 1500
                });
                loadTable(); // โหลดข้อมูลใหม่
            } else {
                // ใช้ SweetAlert เพื่อแจ้งเตือนการบันทึกไม่สำเร็จ
                Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาดในการบันทึก',
                    text: 'กรุณาลองใหม่อีกครั้ง'
                });
            }
        })
        .catch(error => {
            console.error('Error inserting record:', error);
            // แสดง SweetAlert เมื่อเกิดข้อผิดพลาดในการ fetch ข้อมูล
            Swal.fire({
                icon: 'error',
                title: 'เกิดข้อผิดพลาด',
                text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
            });
        });
}

function deleteRecord(DeleateID) {
    Swal.fire({
        title: 'คุณแน่ใจหรือไม่ว่าจะลบข้อมูลนี้?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'ใช่, ลบเลย!',
        cancelButtonText: 'ยกเลิก'
    }).then((result) => {
        if (result.isConfirmed) {
            const data = {
                Id: DeleateID
            };
            fetch('/DeleteForm', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    if (response.ok) {
                        // แสดงข้อความสำเร็จโดยใช้ SweetAlert
                        Swal.fire({
                            icon: 'success',
                            title: 'ลบสำเร็จ',
                            showConfirmButton: false,
                            timer: 1500
                        });
                        loadTable(); // โหลดข้อมูลใหม่
                    } else {
                        // แสดงข้อความผิดพลาดเมื่อไม่พบ ID ที่ระบุ
                        Swal.fire({
                            icon: 'error',
                            title: 'ไม่พบบันทึกที่มี ID ที่ระบุ'
                        });
                    }
                })
                .catch(error => {
                    console.error('Error deleting record:', error);
                    // แสดงข้อความเมื่อเกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์
                    Swal.fire({
                        icon: 'error',
                        title: 'เกิดข้อผิดพลาด',
                        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้'
                    });
                });
        }
    });
}

// ฟังก์ชันค้นหาข้อมูลในตาราง
function SearchDailyDay() {
    const input = document.getElementById('SearchInput');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('PersonTable');
    const tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td');
        let found = false;

        for (let j = 0; j < td.length; j++) {
            if (td[j]) {
                const txtValue = td[j].textContent || td[j].innerText;
                if (txtValue.toLowerCase().indexOf(filter) > -1) {
                    found = true;
                    break;
                }
            }
        }
        tr[i].style.display = found ? "" : "none";
    }
}

// ฟังก์ชันกรองข้อมูลโดยวัน
function filterByDay() {
    const filterDay = document.getElementById('FilterDayInput').value;
    const table = document.getElementById('PersonTable');
    const tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td');
        const startDate = new Date(td[7].innerText); // วันเริ่มต้น
        const endDate = new Date(td[8].innerText); // วันสิ้นสุด
        const selectedDate = new Date(filterDay);

        if ((startDate <= selectedDate && endDate >= selectedDate)) {
            tr[i].style.display = "";
        } else {
            tr[i].style.display = "none";
        }
    }
}

// ฟังก์ชันกรองข้อมูลโดยเดือน
function filterByMonth() {
    const filterMonth = document.getElementById('filterByMonth').value;
    const table = document.getElementById('PersonTable');
    const tr = table.getElementsByTagName('tr');
    const [year, month] = filterMonth.split('-');

    for (let i = 1; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td');
        const startDate = new Date(td[7].innerText); // วันเริ่มต้น
        const monthOfStartDate = startDate.getFullYear() + '-' + (startDate.getMonth() + 1).toString().padStart(2, '0');

        if (monthOfStartDate === filterMonth) {
            tr[i].style.display = "";
        } else {
            tr[i].style.display = "none";
        }
    }
}

// ฟังก์ชันกรองข้อมูลตามสถานะ
function filterByStatus() {
    const filterStatus = document.getElementById('filterByStatus').value;
    const table = document.getElementById('PersonTable');
    const tr = table.getElementsByTagName('tr');

    for (let i = 1; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td');
        if (filterStatus === 'ทั้งหมด') {
            tr[i].style.display = "";
        } else {
            if (td[9].innerText === filterStatus) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}
function validateLeaveRequest(startDate, endDate, leaveType) {
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    // ตรวจสอบการแจ้งล่วงหน้าก่อน 3 วัน
    if (new Date(startDate) < threeDaysFromNow) {
        alert("กรุณาขอลาล่วงหน้าอย่างน้อย 3 วัน");
        return false;
    }

    // ตรวจสอบวันลาไม่เกิน 2 วันติดต่อกัน
    const daysDiff = (new Date(endDate) - new Date(startDate)) / (1000 * 3600 * 24);
    if (daysDiff > 2) {
        alert("กรุณาลาไม่เกิน 2 วันติดต่อกัน");
        return false;
    }

    // ตรวจสอบวันลาย้อนหลัง
    if (new Date(startDate) < today) {
        alert("ไม่อนุญาตให้บันทึกวันลาย้อนหลัง");
        return false;
    }

    return true;
}
function showCustomInput(value) {
    const customInput = document.getElementById('customLeaveType');
    if (value === 'other') {
        customInput.style.display = 'block';
    } else {
        customInput.style.display = 'none';
    }
}

window.onload = loadTable; // โหลดข้อมูลเมื่อหน้าถูกโหลด
