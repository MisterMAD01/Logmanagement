require("dotenv").config(); // โหลดค่าจาก .env

const jwt = require("jsonwebtoken");

if (!process.env.JWT_SECRET) {
  throw new Error("Missing JWT_SECRET in .env");
}

const SECRET = process.env.JWT_SECRET;

function authenticate(requiredRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "Missing token" });

    const token = authHeader.split(" ")[1];
    try {
      const payload = jwt.verify(token, SECRET);
      req.user = payload;

      // ✅ ตรวจสอบ role
      if (requiredRoles.length && !requiredRoles.includes(payload.role)) {
        return res.status(403).json({ error: "Forbidden: insufficient role" });
      }

      // ✅ ตรวจสอบ tenant ยกเว้น Admin
      const tenantParam = req.query.tenant || req.body.tenant;
      if (
        tenantParam &&
        payload.role !== "Admin" &&
        tenantParam !== payload.tenant
      ) {
        return res.status(403).json({ error: "Forbidden: tenant mismatch" });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}

module.exports = { authenticate };
