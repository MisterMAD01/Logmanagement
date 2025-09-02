# คู่มือการติดตั้งระบบ Log Management (โหมด Cloud/SaaS)

คู่มือนี้อธิบายการติดตั้งและรันระบบ Log Management บน **Cloud VM หรือ Container Host** โดยใช้ Docker Compose พร้อม HTTPS/TLS เพื่อให้เข้าถึงระบบจากอินเทอร์เน็ตได้

---

## 1. สิ่งที่ต้องมี (Prerequisites)

**ระบบปฏิบัติการ:**

- Ubuntu 22.04 หรือเวอร์ชันใหม่กว่า

**ทรัพยากรเครื่อง:**

- CPU: 4 vCPU
- RAM: 8 GB
- Disk: 40 GB

**ซอฟต์แวร์:**

- Docker >= 24.x
- Docker Compose >= 2.x
- Domain หรือ Public IP สำหรับ SaaS
- Certificate สำหรับ HTTPS (สามารถใช้ self-signed สำหรับ demo)

**Ports ที่ต้องเปิดใช้งาน:**

- 514/UDP (Syslog)
- 80/TCP (HTTP Frontend)
- 443/TCP (HTTPS Frontend)
- 8000/TCP (Backend API)

---

## 2. Clone Git Repository

เปิด Terminal และรัน:

```bash
git clone https://github.com/your-username/Logmanagement.git
cd Logmanagement
```

### 2.1 สร้างไฟล์ .env แยกโฟลเดอร์

2.1 สำหรับ Backend
cp .env.example backend/.env

2.2 สำหรับ Frontend
cp .env.example frontend/.env
