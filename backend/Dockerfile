# ใช้ Node.js official image
FROM node:20-alpine

# ตั้ง working directory ภายใน container
WORKDIR /app

# คัดลอก package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# คัดลอกโค้ดทั้งหมด
COPY . .

# expose port ที่ backend ใช้งาน
EXPOSE 8000
EXPOSE 514/udp

# รัน backend ด้วย nodemon ใน development mode
CMD ["npx", "nodemon", "-L", "server.js"]
