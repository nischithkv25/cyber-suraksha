import express from 'express';
import { triggerEmergencyAlert, getIncidentHistory, takeActionOnIncident } from '../controllers/emergencyController';

const router = express.Router();

// Normally you would add auth middleware here (e.g., router.post('/trigger', authMiddleware, triggerEmergencyAlert))
router.post('/trigger', triggerEmergencyAlert);
router.get('/history', getIncidentHistory);
router.post('/action', takeActionOnIncident);

export default router;
