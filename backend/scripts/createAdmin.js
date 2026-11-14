require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const schema = new mongoose.Schema({ name:String, email:{type:String,unique:true}, phone:String, password:String, role:String }, { timestamps:true });
const User = mongoose.models.User || mongoose.model('User', schema);

async function run() {
  const { MONGODB_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = 'Gatherly Admin', ADMIN_PHONE = '' } = process.env;
  if (!MONGODB_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error('Set MONGODB_URI, ADMIN_EMAIL, and ADMIN_PASSWORD in backend/.env.');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const email = ADMIN_EMAIL.toLowerCase().trim();
  const user = await User.findOne({ email });
  if (user) { user.role = 'admin'; await user.save(); }
  else await User.create({ name:ADMIN_NAME, email, phone:ADMIN_PHONE, password:await bcrypt.hash(ADMIN_PASSWORD, 12), role:'admin' });
  console.log(`${email} is ready as a Gatherly MongoDB administrator.`);
  await mongoose.disconnect();
}
run().catch((error) => { console.error(error.message); process.exit(1); });
