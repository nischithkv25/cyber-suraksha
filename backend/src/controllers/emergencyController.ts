import { Request, Response } from 'express';
import Incident from '../models/Incident';
import User from '../models/User';
import { evaluateThreatSeverity } from '../services/aiThreatEngine';
import { sendEmergencySMS } from '../services/smsService';
import { triggerPushAlert } from '../services/socketService';
import { generateIncidentHash } from '../services/blockchainService';
import mongoose from 'mongoose';

// Ensure you extend Request properly to include 'user' if you have authentication middleware
interface AuthRequest extends Request {
  user?: { id: string };
}

export const triggerEmergencyAlert = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { scamType, confidenceScore, description } = req.body;
    const userId = req.user?.id || req.body.userId; // Fallback to body for testing

    if (!userId || !scamType || confidenceScore === undefined) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // 1. AI Threat Evaluation
    const threatSeverity = evaluateThreatSeverity(scamType, confidenceScore);
    const timestamp = new Date();

    let smsDelivered = false;
    let pushDelivered = false;

    // 2. Trigger workflows based on severity
    if (threatSeverity === 'HIGH' || threatSeverity === 'MEDIUM') {
      // Send SMS
      if (user.phone) {
        smsDelivered = await sendEmergencySMS(user.phone, threatSeverity, scamType);
      }

      // Trigger Push Notification via Socket.io
      const alertPayload = {
        scamType,
        severity: threatSeverity,
        description,
        timestamp,
        recommendedActions: threatSeverity === 'HIGH' 
          ? ['Freeze Account', 'Contact 1930', 'Generate FIR']
          : ['Review Transactions', 'Change Passwords']
      };
      
      pushDelivered = triggerPushAlert(userId.toString(), alertPayload);
    }

    // 3. Generate Blockchain Integrity Hash
    const blockchainHash = generateIncidentHash(userId.toString(), scamType, threatSeverity, timestamp);

    // 4. Save Incident
    const incident = new Incident({
      userId,
      scamType,
      threatSeverity,
      confidenceScore,
      description,
      smsDelivered,
      pushDelivered,
      blockchainHash,
      status: 'PENDING_REVIEW'
    });

    await incident.save();

    res.status(201).json({
      message: 'Emergency alert processed successfully',
      incident,
      workflowsTriggered: {
        sms: smsDelivered,
        push: pushDelivered
      }
    });

  } catch (error) {
    console.error('Error triggering emergency alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getIncidentHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id || (req.query.userId as string);
    
    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    const incidents = await Incident.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(incidents);
  } catch (error) {
    console.error('Error fetching incident history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const takeActionOnIncident = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { incidentId, action } = req.body;
    
    if (!incidentId || !action) {
      res.status(400).json({ error: 'Missing incidentId or action' });
      return;
    }

    const validActions = ['FREEZE_ACCOUNT', 'GENERATE_FIR', 'DISMISS'];
    if (!validActions.includes(action)) {
      res.status(400).json({ error: 'Invalid action type' });
      return;
    }

    const incident = await Incident.findById(incidentId);
    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }

    // Handle action logic (Mocked for now)
    console.log(`[ACTION] User chose to ${action} for incident ${incidentId}`);
    
    incident.status = action === 'GENERATE_FIR' ? 'FIR_GENERATED' : 'ACTION_TAKEN';
    await incident.save();

    res.status(200).json({ message: `Action ${action} successfully recorded`, incident });

  } catch (error) {
    console.error('Error taking action on incident:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
