const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const User = require('../models/User');
const ComplaintVote = require('../models/ComplaintVote');
const ComplaintUpdate = require('../models/ComplaintUpdate');
const { classifyComplaint } = require('../services/aiService');
const { sendNotification } = require('../services/notificationService');

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mkId() {
  return `C-${Math.floor(1000 + Math.random() * 9000)}`;
}

// ─── Create Complaint ─────────────────────────────────────────────────────────
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, image_url, location, latitude, longitude, phone_number, name } = req.body;
    const userId = req.user.id;
    const citizenName = name || req.user.name || 'Citizen';

    if (!description) return res.status(400).json({ error: 'Description is required.' });

    console.log(`[COMPLAINT] Creating complaint for user: ${userId}`);

    // AI Classification (falls back gracefully)
    const aiResult = await classifyComplaint(description || 'General civic issue');

    const complaintId = mkId();

    const complaint = await Complaint.create({
      id:                       complaintId,
      title:                    title || aiResult.title || 'Untitled Complaint',
      description,
      category:                 aiResult.category,
      department:               aiResult.department,
      urgency:                  aiResult.urgency,
      summary:                  aiResult.summary,
      citizen_recommendation:   aiResult.citizen_recommendation,
      authority_recommendation: aiResult.authority_recommendation,
      workflow:                 aiResult.resolution_workflow,
      current_stage:            aiResult.resolution_workflow?.[0] || 'complaint_received',
      estimated_resolution_time: aiResult.estimated_resolution_time,
      image_url,
      location,
      latitude:  latitude  ? parseFloat(latitude)  : null,
      longitude: longitude ? parseFloat(longitude) : null,
      phone_number,
      created_by: userId,
      status: 'Pending'
    });

    console.log(`[COMPLAINT] Created: ${complaint.id} | Category: ${aiResult.category} | Dept: ${aiResult.department}`);

    // Notification (non-blocking — logged if Twilio not configured)
    sendNotification(phone_number, complaint.id, aiResult.summary, citizenName)
      .catch(err => console.error('[COMPLAINT] Notification error:', err.message));

    // Real-time via Socket.io
    try {
      const io = req.app.get('io');
      io.emit('complaintCreated', complaint);
    } catch (socketErr) {
      console.warn('[COMPLAINT] Socket emit failed:', socketErr.message);
    }

    res.status(201).json({ ...complaint.toJSON(), ai: aiResult });
  } catch (err) {
    console.error('[COMPLAINT] createComplaint error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── Get All Complaints ───────────────────────────────────────────────────────
exports.getAllComplaints = async (req, res) => {
  try {
    const { role, id, department_id } = req.user;
    let where = {};

    if (role === 'Citizen') {
      where = { created_by: id };
    } else if (role === 'Department Admin') {
      where = { department_id };
    }

    const complaints = await Complaint.findAll({
      where,
      include: [
        { model: Department,     attributes: ['name'] },
        { model: User, as: 'creator', attributes: ['name', 'email'] }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(complaints);
  } catch (err) {
    console.error('[COMPLAINT] getAllComplaints error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── Get Complaint by ID ──────────────────────────────────────────────────────
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findByPk(req.params.id, {
      include: [
        { model: Department, attributes: ['name'] },
        {
          model: ComplaintUpdate,
          include: [{ model: User, as: 'updater', attributes: ['name'] }]
        }
      ]
    });

    if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
    res.json(complaint);
  } catch (err) {
    console.error('[COMPLAINT] getComplaintById error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── Update Status ────────────────────────────────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const { status, comment } = req.body;
    const complaint = await Complaint.findByPk(req.params.id);

    if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });

    const oldStatus = complaint.status;
    complaint.status = status;
    await complaint.save();

    await ComplaintUpdate.create({
      complaint_id: complaint.id,
      status,
      comment: comment || '',
      updated_by: req.user.id
    });

    console.log(`[COMPLAINT] Status updated: ${complaint.id} → ${status}`);

    try {
      const io = req.app.get('io');
      io.emit('complaintUpdated', { id: complaint.id, status, oldStatus });
      io.emit('statusChanged',    { id: complaint.id, status });
    } catch (socketErr) {
      console.warn('[COMPLAINT] Socket emit failed:', socketErr.message);
    }

    res.json(complaint);
  } catch (err) {
    console.error('[COMPLAINT] updateStatus error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── Analyze (AI preview) ─────────────────────────────────────────────────────
exports.analyzeComplaint = async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: 'Description is required' });

    const aiResult = await classifyComplaint(description);
    res.json(aiResult);
  } catch (err) {
    console.error('[COMPLAINT] analyzeComplaint error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── Update Progress Stage ────────────────────────────────────────────────────
exports.updateProgress = async (req, res) => {
  try {
    const { current_stage } = req.body;
    const complaint = await Complaint.findByPk(req.params.id);

    if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });

    complaint.current_stage = current_stage;
    await complaint.save();

    console.log(`[COMPLAINT] Progress updated: ${complaint.id} → ${current_stage}`);
    res.json(complaint);
  } catch (err) {
    console.error('[COMPLAINT] updateProgress error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── Vote ─────────────────────────────────────────────────────────────────────
exports.voteComplaint = async (req, res) => {
  try {
    const voter_id = req.user?.id;
    const { id } = req.params;

    if (!voter_id) return res.status(401).json({ message: 'Authentication required to vote.' });

    const complaint = await Complaint.findByPk(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    const existingVote = await ComplaintVote.findOne({ where: { complaint_id: id, voter_id } });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted for this complaint' });
    }

    await ComplaintVote.create({ complaint_id: id, voter_id });
    const updatedVotes = (complaint.votes || 0) + 1;
    await complaint.update({ votes: updatedVotes });

    console.log(`[VOTE] Complaint ${id} → ${updatedVotes} votes`);
    res.json({ message: 'Vote recorded', votes: updatedVotes });
  } catch (error) {
    console.error('[VOTE] Error recording vote:', error.message);
    res.status(500).json({ message: 'Error recording vote' });
  }
};

// ─── Popular / Trending ───────────────────────────────────────────────────────
exports.getPopularComplaints = async (req, res) => {
  try {
    const popular = await Complaint.findAll({
      order: [['votes', 'DESC']],
      limit: 10,
      include: [
        { model: Department, attributes: ['name'] },
        { model: User, as: 'creator', attributes: ['name'] }
      ]
    });
    res.json(popular);
  } catch (error) {
    console.error('[COMPLAINT] getPopularComplaints error:', error.message);
    res.status(500).json({ message: 'Error fetching popular complaints', error: error.message });
  }
};

// ─── Demo Data Generator ──────────────────────────────────────────────────────
// Generates 15 realistic complaints with coords, categories, urgencies, and votes.
// Ensures the system-seeded admin user exists before inserting.
const DEMO_DATA = [
  { title: 'Garbage piling near city market',           desc: 'Huge waste pile uncollected for a week emitting foul smell.',                    cat: 'Sanitation',           urg: 'High',   lat: 12.9716, lng: 77.5946 },
  { title: 'Pothole causing accidents on NH48',         desc: 'Multiple severe potholes near the highway junction causing vehicle damage.',      cat: 'Roads & Infrastructure', urg: 'Urgent', lat: 12.9352, lng: 77.6245 },
  { title: 'Streetlight not working in MG Road park',  desc: 'The main park is pitch dark at night making it unsafe for evening walkers.',      cat: 'Electricity',          urg: 'Medium', lat: 12.9279, lng: 77.6271 },
  { title: 'Water leakage on sector 4 main road',      desc: 'A burst pipe is flooding the road resulting in enormous water wastage.',          cat: 'Water Supply',         urg: 'High',   lat: 12.9562, lng: 77.7013 },
  { title: 'Overflowing drain near bus stand',         desc: 'Drainage overflow flooding footpath; pedestrians unable to walk safely.',        cat: 'Water Supply',         urg: 'High',   lat: 13.0285, lng: 77.5896 },
  { title: 'Broken electric wire near school',         desc: 'A dangling live wire near the school entrance poses serious safety hazard.',      cat: 'Electricity',          urg: 'Urgent', lat: 12.9830, lng: 77.6100 },
  { title: 'Garbage dumpster overflowing near metro',  desc: 'Municipal garbage bin overflowing for 3 days causing traffic and smell issues.',  cat: 'Sanitation',           urg: 'Medium', lat: 12.9719, lng: 77.6412 },
  { title: 'Road cave-in blocks half of main street',  desc: 'Sudden road collapse blocking half the road width; vehicles struggling.',         cat: 'Roads & Infrastructure', urg: 'Urgent', lat: 12.9600, lng: 77.5750 },
  { title: 'Contaminated water from municipal tap',    desc: 'Brown discoloured water from taps in block 7; residents fear contamination.',    cat: 'Water Supply',         urg: 'High',   lat: 12.9440, lng: 77.6560 },
  { title: 'Park benches broken and vandalized',       desc: 'All benches in central park broken; elderly residents have no place to sit.',    cat: 'Parks & Recreation',   urg: 'Low',    lat: 12.9810, lng: 77.5980 },
  { title: 'Suspicious activity near ATM cluster',     desc: 'Unknown persons loitering near ATMs at night; residents feel unsafe.',           cat: 'Public Safety',        urg: 'Medium', lat: 12.9515, lng: 77.6320 },
  { title: 'No street lights on entire colony road',   desc: '500m stretch of residential road completely dark; accidents have occurred.',      cat: 'Electricity',          urg: 'High',   lat: 12.9247, lng: 77.6080 },
  { title: 'Trees blocking road after storm',          desc: 'Two large trees fell on the main road blocking vehicle movement entirely.',       cat: 'Parks & Recreation',   urg: 'Urgent', lat: 13.0100, lng: 77.5900 },
  { title: 'Illegal dumping site near residential area', desc: 'Construction waste being dumped illegally near homes for weeks.',              cat: 'Sanitation',           urg: 'Medium', lat: 12.9880, lng: 77.6200 },
  { title: 'Transformer fire risk near apartments',    desc: 'Old transformer making sparking sounds; building residents fear electrical fire.', cat: 'Electricity',          urg: 'Urgent', lat: 12.9650, lng: 77.5845 },
];

const MOCK_ADMIN_ID = '00000000-0000-0000-0000-000000000000';

exports.generateDemoComplaints = async (req, res) => {
  try {
    // Ensure the system admin seed user exists
    const adminExists = await User.count({ where: { id: MOCK_ADMIN_ID } });
    if (!adminExists) {
      await User.create({
        id:       MOCK_ADMIN_ID,
        name:     'System Admin',
        email:    'admin@system.local',
        password: 'not-used',
        role:     'Department Admin'
      });
      console.log('[DEMO] System admin user seeded.');
    }

    const created = [];

    for (const item of DEMO_DATA) {
      const id    = `DEMO-${Math.floor(Math.random() * 90000 + 10000)}`;
      const votes = Math.floor(Math.random() * 25);
      const statuses = ['Pending', 'In Progress', 'Resolved', 'Pending', 'Pending'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      try {
        const cmp = await Complaint.create({
          id,
          title:       item.title,
          description: item.desc,
          category:    item.cat,
          urgency:     item.urg,
          department:  item.cat + ' Department',
          summary:     `${item.cat} issue reported: ${item.desc.substring(0, 80)}`,
          citizen_recommendation:   'Follow guidelines from the relevant department.',
          authority_recommendation: 'Dispatch the relevant team for immediate inspection.',
          workflow:    ['complaint_received', 'department_assigned', 'inspection_scheduled', 'work_in_progress', 'resolved'],
          current_stage: 'complaint_received',
          estimated_resolution_time: '3-5 business days',
          created_by:  MOCK_ADMIN_ID,
          status,
          votes,
          latitude:  item.lat + (Math.random() - 0.5) * 0.02,
          longitude: item.lng + (Math.random() - 0.5) * 0.02
        });
        created.push(cmp);
      } catch (e) {
        console.warn(`[DEMO] Skipping duplicate or error for "${item.title}":`, e.message);
      }
    }

    console.log(`[DEMO] Generated ${created.length} demo complaints.`);
    res.status(201).json({ message: 'Demo complaints generated', count: created.length });
  } catch (error) {
    console.error('[DEMO] Error generating demo complaints:', error.message);
    res.status(500).json({ message: 'Error generating data', error: error.message });
  }
};
