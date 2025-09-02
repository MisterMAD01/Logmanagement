# คู่มือการติดตั้งระบบ Log Management (โหมด Appliance)

คู่มือนี้อธิบายขั้นตอนการติดตั้งและรันระบบ Log Management ทั้งหมดบนเครื่องเดียว (Ubuntu 22.04+) โดยใช้ Docker Compose ซึ่งเป็นวิธีง่ายและรวดเร็วที่สุด

---

## 1. สิ่งที่ต้องมี (Prerequisites)

**ระบบปฏิบัติการ:**

- Ubuntu 22.04 หรือเวอร์ชันใหม่กว่า

**ทรัพยากรเครื่อง:**

- CPU: 4 vCPU
- RAM: 8 GB
- Disk: 40 GB

**ซอฟต์แวร์:**

- Docker: ติดตั้ง Docker Engine และ CLI เวอร์ชันล่าสุด
- Docker Compose: เวอร์ชัน 2.x ขึ้นไป

---

## 2. ขั้นตอนการติดตั้ง

### ขั้นตอนที่ 1: Clone Git Repository

เปิด Terminal และรันคำสั่ง:

```bash
git clone https://github.com/your-username/Logmanagement.git
cd Logmanagement
```

### ขั้นตอนที่ 2: สร้างไฟล์ .env แยกโฟลเดอร์

2.1 สำหรับ Backend
cp .env.example backend/.env

2.2 สำหรับ Frontend
cp .env.example frontend/.env

## 3. ขั้นตอนการรัน

cd /path/to/Logmanagement

Dev / Appliance (Local)
bash run.sh dev

SaaS / Production
bash run.sh saas
