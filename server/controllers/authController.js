const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Department } = require('../models');

exports.signup = async (req, res) => {
  try {
    const { name, email, password, role, department_name } = req.body;

    // Check if user exists
    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ error: 'User already exists.' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    let department_id = null;
    if (role === 'Department Admin' && department_name) {
      const dept = await Department.findOne({ where: { name: department_name } });
      if (dept) department_id = dept.id;
    }

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'Citizen',
      department_id
    });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, department_id: user.department_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials.' });

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, department_id: user.department_id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
