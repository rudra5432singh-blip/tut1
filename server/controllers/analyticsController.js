const { Complaint, Department } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// ─── Complaint Locations (for heatmap) ───────────────────────────────────────
exports.getComplaintLocations = async (req, res) => {
  try {
    const { category, status, department, startDate, endDate } = req.query;
    let where = {};

    if (category)   where.category    = category;
    if (status)     where.status      = status;
    if (department) where.department  = department;

    if (startDate && endDate) {
      where.created_at = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }

    // Only return complaints that have GPS coordinates
    where.latitude  = { [Op.ne]: null };
    where.longitude = { [Op.ne]: null };

    const complaints = await Complaint.findAll({
      where,
      attributes: ['id', 'title', 'category', 'latitude', 'longitude', 'status', 'urgency', 'votes', 'created_at'],
      include: [{ model: Department, attributes: ['name'] }]
    });

    res.json(complaints);
  } catch (err) {
    console.error('[ANALYTICS] getComplaintLocations error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// ─── Analytics Summary (for charts) ──────────────────────────────────────────
exports.getAnalyticsSummary = async (req, res) => {
  try {
    const all = await Complaint.findAll({
      attributes: ['category', 'status', 'urgency', 'votes', 'created_at']
    });

    // Status breakdown
    const statusCounts = all.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});

    // Category breakdown
    const categoryCounts = all.reduce((acc, c) => {
      const k = c.category || 'Other';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

    // Urgency breakdown
    const urgencyCounts = all.reduce((acc, c) => {
      const k = c.urgency || 'Normal';
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});

    // Complaints over time (last 7 days)
    const now = new Date();
    const daily = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      daily[key] = 0;
    }
    all.forEach(c => {
      const key = new Date(c.created_at).toISOString().split('T')[0];
      if (daily.hasOwnProperty(key)) daily[key]++;
    });

    // Top voted complaints
    const topVoted = [...all]
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, 5)
      .map(c => ({ category: c.category, votes: c.votes || 0 }));

    res.json({
      total:          all.length,
      statusCounts,
      categoryCounts,
      urgencyCounts,
      dailyTrend:     daily,
      topVoted
    });
  } catch (err) {
    console.error('[ANALYTICS] getAnalyticsSummary error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
