import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';

const router = Router();
export const JWT_SECRET = process.env.JWT_SECRET || 'heatshield-secure-secret-key-2026';

// Password criteria validator
export function validatePassword(password) {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*...).' };
  }
  return { valid: true };
}

// Register
router.post('/register', (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, city, state } = req.body;

    if (!fullName || !email || !password || !confirmPassword || !city || !state) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const pwdValidation = validatePassword(password);
    if (!pwdValidation.valid) {
      return res.status(400).json({ error: pwdValidation.message });
    }

    // Check existing
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const stmt = db.prepare(`
      INSERT INTO users (full_name, email, password_hash, city, state, role)
      VALUES (?, ?, ?, ?, ?, 'Citizen')
    `);
    const info = stmt.run(fullName.trim(), email.toLowerCase().trim(), passwordHash, city.trim(), state.trim());
    const userId = Number(info.lastInsertRowid);

    const user = {
      id: userId,
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      city: city.trim(),
      state: state.trim(),
      role: 'Citizen'
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const userRecord = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (!userRecord) {
      // Must match required prompt string
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const match = bcrypt.compareSync(password, userRecord.password_hash);
    if (!match) {
      // Exact prompt specification: "Incorrect password. Please try again."
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    const user = {
      id: userRecord.id,
      fullName: userRecord.full_name,
      email: userRecord.email,
      city: userRecord.city,
      state: userRecord.state,
      role: userRecord.role
    };

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful.',
      token,
      user
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication service encountered an error.' });
  }
});

// Auth Middleware
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Session expired or invalid token.' });
    }
    req.user = user;
    next();
  });
}

// Current User Me
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, full_name, email, city, state, role, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Check if user has personal vulnerability profile
    const profile = db.prepare('SELECT * FROM personal_profiles WHERE user_id = ?').get(req.user.id);

    res.json({
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        city: user.city,
        state: user.state,
        role: user.role,
        hasProfile: !!profile
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve user session.' });
  }
});

export default router;
