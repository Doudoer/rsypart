const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Validate part using external API (mock for now)
router.post('/validate', authMiddleware, async (req, res) => {
  const { year, marca, modelo, parte } = req.body;

  if (!year || !marca || !modelo || !parte) {
    return res.status(400).json({ error: 'year, marca, modelo, and parte are required' });
  }

  try {
    // Mock validation - in production, this would call a real API
    // Example: const response = await axios.get(`https://api.parts-db.com/validate?year=${year}&brand=${marca}&model=${modelo}&part=${parte}`);
    
    // For now, we'll do basic validation
    const currentYear = new Date().getFullYear();
    const yearNum = parseInt(year);

    if (isNaN(yearNum) || yearNum < 1900 || yearNum > currentYear + 1) {
      return res.json({ 
        valid: false, 
        message: 'Invalid year' 
      });
    }

    // Mock successful validation
    res.json({ 
      valid: true, 
      message: 'Part validated successfully',
      data: {
        year,
        marca,
        modelo,
        parte
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Validation service error',
      message: error.message 
    });
  }
});

module.exports = router;
