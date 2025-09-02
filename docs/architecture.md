# Log Management System - Architecture

## 1. Overview

ระบบนี้เป็น **Log Management System** สำหรับเก็บและวิเคราะห์ log/event จากหลายแหล่ง โดยรองรับทั้ง **Appliance (ติดตั้งในเครื่อง/VM)**  
รองรับฟีเจอร์หลัก:

- การนำเข้า Log จากหลาย protocol
- Normalization เป็น schema กลาง
- Storage & Query ที่รวดเร็ว
- Dashboard/UI สำหรับการค้นหาและวิเคราะห์
- Alert Engine สำหรับแจ้งเตือนตามเงื่อนไข
- AuthN/AuthZ และ Tenant Isolation
- TLS สำหรับการเข้ารหัสข้อมูลใน SaaS

---

## 2. Data Flow and Components

### 2.1 Ingestion Layer (การนำเข้าข้อมูล)

จุดแรกที่ Log จะเข้าสู่ระบบ รองรับหลายช่องทาง:

- **Syslog UDP (Port 514)**  
  อุปกรณ์เครือข่าย (Firewall, Router) ส่ง log มาในรูปแบบ Syslog  
  Backend API มี Syslog Listener คอยรับและส่งต่อไปยัง Normalization

- **HTTP API (Port 8000)**  
  แอปพลิเคชันหรือสคริปต์ส่ง Log ในรูปแบบ JSON ผ่าน REST API Endpoint `/ingest`

- **File Ingestion**  
  สคริปต์ batch อ่านไฟล์ log (AWS CloudTrail, Microsoft 365) แล้วส่งไป Normalization

**Flow Diagram:**

    %% Ingestion Layer
    subgraph Ingest["Ingestion Layer"]
        FW[Firewall / Router]
        App[Application / API]
        Batch[Batch File]
        Collector[Collector / Ingest]
    end

    %% Processing & Storage
    subgraph Processing["Processing & Storage Layer"]
        Normalizer[Normalizer]
        Storage[OpenSearch / Index]
        Backend[Backend API]
        Alert[Alert Engine]
    end

    %% Presentation Layer
    subgraph Presentation["Presentation Layer"]
        Frontend[Frontend UI / Dashboard]
    end

    %% Connections
    FW -->|Syslog UDP| Collector
    App -->|HTTP POST| Collector
    Batch -->|Script| Collector

    Collector --> Normalizer
    Normalizer --> Storage
    Storage --> Backend
    Backend --> Frontend

    Normalizer --> Alert

---

### 2.2 Storage & Processing Layer (การจัดเก็บและประมวลผล)

- **Backend API (Node.js/Express )**

  - **Normalization:** แปลง Log ดิบเป็น schema กลาง
  - **Data Ingestion:** ส่งข้อมูลไป OpenSearch
  - **Query:** รับคำค้นหาและ Aggregation จาก Frontend
  - **Security:** JWT

- **OpenSearch**
  - **Indexing:** จัดทำดัชนีเพื่อค้นหาเร็ว
  - **Search & Aggregation:** รองรับ Full-text search และ Aggregation สำหรับ Dashboard
  - **Data Retention:** ILM ลบข้อมูลเกิน 7 วันอัตโนมัติ

---

### 2.3 Presentation Layer (ส่วนแสดงผล)

- **Frontend UI (React)**

  - Log Search: ค้นหา log ตามเงื่อนไข
  - Dashboard: แสดงกราฟ เช่น Top IP, Timeline
  - Alerts: แสดงรายการแจ้งเตือน

---

## 3. Tenant Model (การจัดการข้อมูลลูกค้า)

- **Single-Index, Logical Separation**: Log ของทุก tenant อยู่ใน OpenSearch Index เดียว (`logs`)
- **Field สำหรับแยก Tenant**: `"tenant": "demoA"`
- **Authorization Middleware**
  - **Admin:** เข้าถึง Log ทุก Tenant
  - **Viewer:** เข้าถึง Log เฉพาะ Tenant ของตน
    - Backend เพิ่ม filter `{ "term": { "tenant": "your_tenant_id" } }` อัตโนมัติ
- **Security:** Viewer ไม่สามารถเข้าถึง log ของ tenant อื่นได้

---

## 4. Alert Flow

ระบบ Alert Flow ทำหน้าที่ตรวจสอบ log ที่เข้ามาและสร้างการแจ้งเตือนตามกฎที่กำหนด เช่น หากมีการ **login failed เกิน 3 ครั้งใน 5 นาที** ระบบจะสร้าง alert และส่งต่อไปยังช่องทางต่าง ๆ

### ขั้นตอนการทำงาน

1. **Log Ingestion:** Backend API รับ log ที่เข้ามา
2. **Rule Evaluation:** ตรวจสอบ log ตามเงื่อนไข rule
   - ตัวอย่าง: `event_type = LogonFailed`, threshold = 3 ครั้ง, window = 5 นาที
3. **Alert Generation:** หากตรงเงื่อนไข Alert Engine จะสร้าง event และส่งไปยัง:
   - UI Dashboard
   - Email (SMTP)
   - Webhook Endpoint

### ตัวอย่าง Rule (JSON)

```json
{
  "rule_name": "MultipleFailedLogin",
  "condition": {
    "event_type": "LogonFailed",
    "threshold": 3,
    "window_minutes": 5
  },
  "actions": ["dashboard_alert", "email", "webhook"]
}
```

## 5. Frontend Pages & API Integration

### 5.1 Login Page

- รับ username/password
- ส่ง `/auth/login`
- หากสำเร็จ ส่ง log `web_login_success` ไป `/ingest`
- หากล้มเหลว ส่ง log `web_login_failed` และตรวจสอบ alert `/alerts/check-login-fail`

### 5.2 Dashboard

- แสดง summary, timeline, top IP/user/event
- Filters: tenant, source, time range
- เรียก `/logs` และ `/alerts` เพื่อดึงข้อมูล
- Modal แสดง alert และ refresh

### 5.3 Log Search Page

- ฟิลเตอร์: tenant, source, action, IP, severity, event_type
- ส่ง request `/search` และแสดงผลในตาราง

### 5.4 Test Page

- Simulator log สำหรับทดสอบ syslog, ingest, cloud logs
- ส่ง log ตัวอย่างไปยัง API เช่น `/ingest-file`, `/run/syslog`

## 6. Security & Notes

- การเข้ารหัส TLS สำหรับการสื่อสาร API และ Web UI
- JWT + RBAC สำหรับ Authentication และ Authorization
- Tenant Isolation: Viewer ไม่สามารถเข้าถึง log ของ tenant อื่น
- Audit log สำหรับการเข้าใช้งาน Dashboard และ API
