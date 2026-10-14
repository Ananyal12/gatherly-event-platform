require('dotenv').config();
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

async function run() {
  const file = path.join(__dirname, '..', 'data', 'gatherly.json');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const data = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { users: [], events: [], tickets: [], feedback: [] };
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  if (!email || !process.env.ADMIN_PASSWORD) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env.');
  let user = data.users.find((item) => item.email === email);
  if (user) user.role = 'admin';
  else { user = { id: crypto.randomUUID(), name: process.env.ADMIN_NAME || 'Gatherly Admin', email, phone: process.env.ADMIN_PHONE || '9999999999', password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12), role: 'admin', createdAt: new Date().toISOString() }; data.users.push(user); }
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`${email} is ready as a Gatherly administrator.`);
}
run().catch((error) => { console.error(error.message); process.exit(1); });
