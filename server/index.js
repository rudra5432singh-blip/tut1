const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db');
const { Department, Complaint, User, ComplaintVote } = require('./models');

// Define relationships
User.hasMany(Complaint, { foreignKey: 'created_by' });
Complaint.belongsTo(User, { foreignKey: 'created_by' });

Complaint.hasMany(ComplaintVote, { foreignKey: 'complaint_id' });
ComplaintVote.belongsTo(Complaint, { foreignKey: 'complaint_id' });

User.hasMany(ComplaintVote, { foreignKey: 'voter_id' });
ComplaintVote.belongsTo(User, { foreignKey: 'voter_id' });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT']
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/complaints', require('./routes/complaints'));
app.use('/analytics', require('./routes/analytics'));

// Socket.io injection for controllers
app.set('io', io);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    
    // Sync models — use force: false to avoid SQLite FK constraint errors.
    // New columns are added by the PRAGMA-based migration block below.
    await sequelize.sync({ force: false });

    // Safety net: ensure newer columns exist in SQLite even if alter didn't apply
    try {
      const [columns] = await sequelize.query('PRAGMA table_info(Complaints)');
      const colNames = (columns || []).map(c => c.name);
      if (!colNames.includes('latitude')) {
        await sequelize.query('ALTER TABLE Complaints ADD COLUMN latitude FLOAT');
      }
      if (!colNames.includes('longitude')) {
        await sequelize.query('ALTER TABLE Complaints ADD COLUMN longitude FLOAT');
      }
      if (!colNames.includes('priority')) {
        await sequelize.query("ALTER TABLE Complaints ADD COLUMN priority TEXT DEFAULT 'normal'");
      }
      if (!colNames.includes('department')) {
        await sequelize.query('ALTER TABLE Complaints ADD COLUMN department TEXT');
      }
      if (!colNames.includes('urgency')) {
        await sequelize.query('ALTER TABLE Complaints ADD COLUMN urgency TEXT');
      }
      if (!colNames.includes('summary')) {
        await sequelize.query('ALTER TABLE Complaints ADD COLUMN summary TEXT');
      }
      if (!colNames.includes('workflow')) {
        await sequelize.query('ALTER TABLE Complaints ADD COLUMN workflow JSON');
      }
      if (!colNames.includes('current_stage')) {
        try {
          await sequelize.query('ALTER TABLE Complaints ADD COLUMN current_stage TEXT');
          console.log('Added current_stage column successfully.');
        } catch (e) {
          if (!e.message.includes('duplicate column name')) console.log(e.message);
        }
      }
      if (!colNames.includes('estimated_resolution_time')) {
        try {
          await sequelize.query('ALTER TABLE Complaints ADD COLUMN estimated_resolution_time TEXT');
          console.log('Added estimated_resolution_time column successfully.');
        } catch (e) {
          if (!e.message.includes('duplicate column name')) console.log(e.message);
        }
      }
      if (!colNames.includes('votes')) {
        try {
          await sequelize.query('ALTER TABLE Complaints ADD COLUMN votes INTEGER DEFAULT 0');
          console.log('Added votes column successfully.');
        } catch (e) {
          if (!e.message.includes('duplicate column name')) console.log(e.message);
        }
      }
      if (!colNames.includes('phone_number')) {
        try {
          await sequelize.query('ALTER TABLE Complaints ADD COLUMN phone_number TEXT');
          console.log('Added phone_number column successfully.');
        } catch (e) {
          if (!e.message.includes('duplicate column name')) console.log(e.message);
        }
      }
      if (!colNames.includes('citizen_recommendation')) {
        try {
          await sequelize.query('ALTER TABLE Complaints ADD COLUMN citizen_recommendation TEXT');
          console.log('Added citizen_recommendation column successfully.');
        } catch (e) {
          if (!e.message.includes('duplicate column name')) console.log(e.message);
        }
      }
      if (!colNames.includes('authority_recommendation')) {
        try {
          await sequelize.query('ALTER TABLE Complaints ADD COLUMN authority_recommendation TEXT');
          console.log('Added authority_recommendation column successfully.');
        } catch (e) {
          if (!e.message.includes('duplicate column name')) console.log(e.message);
        }
      }
    } catch (err) {
      console.warn('SQLite migration check failed:', err.message);
    }
    
    // Seed Departments if empty
    const count = await Department.count();
    if (count === 0) {
      await Department.bulkCreate([
        { name: 'Road Maintenance Department', code: 'ROAD' },
        { name: 'Sanitation Department', code: 'GARBAGE' },
        { name: 'Electricity Department', code: 'ELECTRICITY' },
        { name: 'Water Supply Department', code: 'WATER' },
        { name: 'Drainage Department', code: 'DRAINAGE' }
      ]);
      console.log('Departments seeded.');
    }

    const deptRecords = await Department.findAll();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    // Seed some sample complaints with coordinates if none exist
    const complaintCount = await Complaint.count();
    if (complaintCount === 0) {
      const mockAdminId = '00000000-0000-0000-0000-000000000000';
      const userCount = await User.count({ where: { id: mockAdminId } });
      if (userCount === 0) {
        await User.create({
          id: mockAdminId,
          name: 'System Admin',
          email: 'admin@system.local',
          password: 'mockpassword', // usually hashed, but mock is ok here
          role: 'Department Admin'
        });
      }

      const sampleCoords = [
        { lat: 12.9716, lng: 77.5946, cat: 'Roads & Infrastructure' },
        { lat: 12.9352, lng: 77.6245, cat: 'Water Supply' },
        { lat: 12.9279, lng: 77.6271, cat: 'Electricity' },
        { lat: 12.9562, lng: 77.7013, cat: 'Sanitation' },
        { lat: 13.0285, lng: 77.5896, cat: 'Public Safety' },
      ];

      for (let i = 0; i < sampleCoords.length; i++) {
        const coord = sampleCoords[i];
        const dept = deptRecords.find(d => d.name.includes(coord.cat.split(' ')[0]));
        await Complaint.create({
          id: `C-INIT-${i}`,
          title: `Initial Sample: ${coord.cat}`,
          description: 'Automatically generated sample for heatmap visualization.',
          category: coord.cat,
          department_id: dept?.id,
          latitude: coord.lat,
          longitude: coord.lng,
          created_by: '00000000-0000-0000-0000-000000000000', // Mock Admin
          status: 'Pending'
        });
      }
      console.log('Sample geospatial data seeded.');
    }
  } catch (err) {
    console.error('Unable to start server:', err);
  }
};

startServer();
