require("dotenv").config(); // อ่านไฟล์ .env

const jwt = require("jsonwebtoken");
const users = require("./users");
const SECRET = process.env.JWT_SECRET;

function login(req, res) {
  const { username, password } = req.body;
  const user = users[username];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const payload = {
    username,
    role: user.role,
    tenant: user.tenant,
  };

  const token = jwt.sign(payload, SECRET, { expiresIn: "1h" });
  res.json({ token });
}

function profile(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, profile };
