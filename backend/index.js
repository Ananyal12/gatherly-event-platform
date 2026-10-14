require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;
const SECRET = process.env.JWT_SECRET || 'gatherly-local-secret';
const file = path.join(__dirname, 'data', 'gatherly.json');
const legacyFile = path.join(__dirname, 'data', 'eventora.json');
fs.mkdirSync(path.dirname(file), { recursive: true });
if (!fs.existsSync(file) && fs.existsSync(legacyFile)) fs.copyFileSync(legacyFile, file);
const blank = () => ({ users: [], events: [], tickets: [], feedback: [] });
const read = () => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return blank(); } };
const save = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));
const id = () => crypto.randomUUID();
const pub = (u) => ({ id:u.id, name:u.name, email:u.email, phone:u.phone, role:u.role, createdAt:u.createdAt });
const token = (u) => jwt.sign({ sub:u.id, role:u.role }, SECRET, { expiresIn:'7d' });
const missing = (b, keys) => keys.filter(k => !String(b[k] || '').trim());
const payload = (b) => ({ title:String(b.title||'').trim(), description:String(b.description||'').trim(), date:b.date, time:String(b.time||'').trim(), venue:String(b.venue||'').trim(), category:String(b.category||'').toLowerCase(), capacity:Number(b.capacity), price:Number(b.price), image:String(b.image||'').trim(), status:b.status || 'upcoming' });
const view = (e) => ({...e, availableSpots:e.capacity-e.bookedBy.length, isFull:e.bookedBy.length>=e.capacity});
function seedDemoEvents() {
  const data = read();
  if (data.events.length) return;
  const now = new Date().toISOString();
  data.events.push(
    { id:id(), title:'Designing Tomorrow: Product & AI Summit', description:'A full-day summit for students, builders and product thinkers exploring responsible AI and product innovation.', date:'2026-11-14', time:'10:00', venue:'Bangalore International Centre', category:'conference', capacity:120, price:499, image:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=80', status:'upcoming', bookedBy:[], createdAt:now },
    { id:id(), title:'Build Your First Full-Stack App', description:'A practical workshop on React, APIs, authentication, data modelling and deployment for aspiring software engineers.', date:'2026-11-22', time:'14:30', venue:'NASSCOM Startup Hub, Bengaluru', category:'workshop', capacity:60, price:0, image:'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80', status:'upcoming', bookedBy:[], createdAt:now },
    { id:id(), title:'Campus Creators Night', description:'An evening of music, networking, student showcases and memorable conversations for the creative community.', date:'2026-12-06', time:'18:00', venue:'Indiranagar Social, Bengaluru', category:'party', capacity:90, price:299, image:'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80', status:'upcoming', bookedBy:[], createdAt:now }
  );
  data.events.forEach((event) => { event._id = event.id; });
  save(data);
}
seedDemoEvents();
function ensureAdmin() {
  const email = String(process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  const password = String(process.env.ADMIN_PASSWORD || '');
  if (!email || !password) return;
  const data = read();
  if (data.users.some((user) => user.email === email)) return;
  data.users.push({ id:id(), name:process.env.ADMIN_NAME || 'Administrator', email, phone:process.env.ADMIN_PHONE || '', password:bcrypt.hashSync(password, 12), role:'admin', createdAt:new Date().toISOString() });
  save(data);
}
ensureAdmin();
app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true }));
app.use(express.json({limit:'1mb'}));
function auth(req,res,next){const t=req.headers.authorization?.replace(/^Bearer\s+/i,'');if(!t)return res.status(401).json({message:'Please sign in to continue.'});try{req.auth=jwt.verify(t,SECRET);next();}catch{return res.status(401).json({message:'Your session has expired. Please sign in again.'});}}
function admin(req,res,next){if(req.auth.role!=='admin')return res.status(403).json({message:'Administrator access is required.'});next();}
app.get('/api/v1/health',(req,res)=>res.json({status:'ok',database:'local-persistent-store'}));
app.post('/api/v1/auth/register',async(req,res)=>{const m=missing(req.body,['name','email','phone','password']);if(m.length)return res.status(400).json({message:`Required: ${m.join(', ')}`});const d=read(),email=req.body.email.toLowerCase().trim();if(d.users.some(u=>u.email===email))return res.status(409).json({message:'An account with this email already exists.'});const u={id:id(),name:req.body.name.trim(),email,phone:req.body.phone.trim(),password:await bcrypt.hash(req.body.password,12),role:'user',createdAt:new Date().toISOString()};d.users.push(u);save(d);res.status(201).json({message:'Your account is ready.',token:token(u),user:pub(u)});});
app.post('/api/v1/auth/login',async(req,res)=>{const d=read(),u=d.users.find(x=>x.email===String(req.body.email||'').toLowerCase().trim());if(!u||!(await bcrypt.compare(req.body.password||'',u.password)))return res.status(401).json({message:'Incorrect email or password.'});u.lastLogin=new Date().toISOString();save(d);res.json({message:'Welcome back.',token:token(u),user:pub(u)});});
app.get('/api/v1/me',auth,(req,res)=>{const u=read().users.find(x=>x.id===req.auth.sub);if(!u)return res.status(404).json({message:'Account not found.'});res.json({user:pub(u)});});
app.put('/api/v1/me',auth,async(req,res)=>{const d=read(),u=d.users.find(x=>x.id===req.auth.sub);if(!u)return res.status(404).json({message:'Account not found.'});if(req.body.email?.trim()){const email=req.body.email.toLowerCase().trim();if(email!==u.email&&d.users.some(x=>x.email===email))return res.status(409).json({message:'That email is already in use.'});u.email=email;}['name','phone'].forEach(k=>{if(req.body[k]?.trim())u[k]=req.body[k].trim();});if(req.body.newPassword){if(!(await bcrypt.compare(req.body.currentPassword||'',u.password)))return res.status(400).json({message:'Your current password is incorrect.'});u.password=await bcrypt.hash(req.body.newPassword,12);}save(d);res.json({message:'Profile updated.',user:pub(u)});});
app.get('/api/v1/events',(req,res)=>res.json({events:read().events.filter(e=>e.status!=='cancelled').sort((a,b)=>`${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map(view)}));
app.post('/api/v1/events',auth,admin,(req,res)=>{const e=payload(req.body),m=missing(e,['title','description','date','time','venue','category']);if(m.length||!Number.isInteger(e.capacity)||e.capacity<1||Number.isNaN(e.price)||e.price<0)return res.status(400).json({message:'Please provide valid event details, capacity, and price.'});const d=read(),record={...e,id:id(),createdBy:req.auth.sub,bookedBy:[],createdAt:new Date().toISOString()};record._id=record.id;d.events.push(record);save(d);res.status(201).json({message:'Event published.',event:view(record)});});
app.put('/api/v1/events/:id',auth,admin,(req,res)=>{const d=read(),e=d.events.find(x=>x.id===req.params.id);if(!e)return res.status(404).json({message:'Event not found.'});const p=payload(req.body);if(!Number.isInteger(p.capacity)||p.capacity<e.bookedBy.length)return res.status(400).json({message:`Capacity cannot be lower than ${e.bookedBy.length}.`});Object.assign(e,p);save(d);res.json({message:'Event updated.',event:view(e)});});
app.delete('/api/v1/events/:id',auth,admin,(req,res)=>{const d=read(),i=d.events.findIndex(x=>x.id===req.params.id);if(i<0)return res.status(404).json({message:'Event not found.'});d.tickets.filter(t=>t.event===req.params.id&&t.status==='confirmed').forEach(t=>t.status='cancelled');d.events.splice(i,1);save(d);res.json({message:'Event and associated tickets removed.'});});
app.post('/api/v1/events/:id/book',auth,(req,res)=>{const d=read(),e=d.events.find(x=>x.id===req.params.id);if(!e||e.status!=='upcoming'||e.bookedBy.includes(req.auth.sub)||e.bookedBy.length>=e.capacity)return res.status(400).json({message:'This event is unavailable, full, or already booked.'});e.bookedBy.push(req.auth.sub);const t={id:id(),event:e.id,user:req.auth.sub,ticketNumber:`EVT-${crypto.randomBytes(4).toString('hex').toUpperCase()}`,status:'confirmed',createdAt:new Date().toISOString()};t._id=t.id;d.tickets.push(t);save(d);res.status(201).json({message:'Booking confirmed — your ticket is ready.',ticket:t});});
app.get('/api/v1/tickets/me',auth,(req,res)=>{const d=read();res.json({tickets:d.tickets.filter(t=>t.user===req.auth.sub).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).map(t=>({...t,event:d.events.find(e=>e.id===t.event)||null}))});});
app.delete('/api/v1/tickets/:id',auth,(req,res)=>{const d=read(),t=d.tickets.find(x=>x.id===req.params.id&&x.user===req.auth.sub&&x.status==='confirmed');if(!t)return res.status(404).json({message:'Active ticket not found.'});t.status='cancelled';const e=d.events.find(x=>x.id===t.event);if(e)e.bookedBy=e.bookedBy.filter(x=>x!==req.auth.sub);save(d);res.json({message:'Your booking has been cancelled.'});});
app.post('/api/v1/feedback',(req,res)=>{const m=missing(req.body,['name','email','message']);if(m.length)return res.status(400).json({message:'Please complete every field.'});const d=read();d.feedback.push({id:id(),name:req.body.name.trim(),email:req.body.email.toLowerCase().trim(),message:req.body.message.trim(),createdAt:new Date().toISOString()});save(d);res.status(201).json({message:'Thanks — your message has been received.'});});
app.get('/api/v1/admin/overview',auth,admin,(req,res)=>{const d=read();res.json({metrics:{users:d.users.length,events:d.events.length,tickets:d.tickets.filter(t=>t.status==='confirmed').length},feedback:d.feedback.slice(-10).reverse()});});
app.get('/api/v1/admin/users',auth,admin,(req,res)=>res.json({users:read().users.map(pub)}));
app.use('/api/v1',(req,res)=>res.status(404).json({message:'API route not found.'}));
const clientBuild = path.join(__dirname, '..', 'frontend', 'build');
if (fs.existsSync(clientBuild)) {
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => res.sendFile(path.join(clientBuild, 'index.html')));
} else {
  app.use((req,res)=>res.status(404).json({message:'Client build not found. Run the frontend development server or build it for production.'}));
}
app.listen(PORT,()=>console.log(`Gatherly API listening on ${PORT} (local persistent database)`));
