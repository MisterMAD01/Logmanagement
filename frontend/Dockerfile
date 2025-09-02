# ใช้ Node.js base image
FROM node:20-alpine

WORKDIR /app

# copy package.json และ package-lock.json
COPY package*.json ./

# ติดตั้ง dependencies
RUN npm install

# copy source code ทั้งหมด
COPY . .

# expose port ที่ React ใช้ (ปกติคือ 3000)
EXPOSE 3000

# รัน react app ด้วย npm start
CMD ["npm", "start"]
