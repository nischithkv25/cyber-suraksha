import express from 'express';
import { getLatestPhishingThreats } from '../services/openphishService';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const threats = getLatestPhishingThreats();
    res.json(threats);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to retrieve phishing threats' });
  }
});

export default router;
