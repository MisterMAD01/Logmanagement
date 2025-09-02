# Log Management System

ระบบ **Log Management** สำหรับเก็บและวิเคราะห์ log/event จากหลายแหล่ง รองรับทั้ง **Appliance (Local/Dev)** และ **SaaS/Production**  

---

## 1. Features

- การนำเข้า Log จากหลาย protocol (Syslog UDP, HTTP API, File ingestion)
- Normalization เป็น schema กลาง
- Storage & Query ที่รวดเร็ว (OpenSearch)
- Dashboard/UI สำหรับค้นหาและวิเคราะห์
- Alert Engine สำหรับแจ้งเตือนตามเงื่อนไข
- AuthN/AuthZ และ Tenant Isolation
- TLS สำหรับเข้ารหัสข้อมูลใน SaaS

---

## 2. Prerequisites

**OS:** Linux (Ubuntu 20.04+), macOS หรือ Windows 10+ (WSL2)  
**Resources:** CPU 4 cores, RAM 8GB, Disk 40GB  
**Software:**

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)
- [Node.js & npm](https://nodejs.org/) – optional สำหรับแก้ไข local dev

ตรวจสอบเวอร์ชัน:

```bash
docker --version
docker compose version
git --version
git clone https://github.com/MisterMAD01/Logmanagement.git
cd Logmanagement
cp .env.example backend/.env
cp .env.example frontend/.env
bash run.sh dev
bash run.sh saas
docker compose ps
