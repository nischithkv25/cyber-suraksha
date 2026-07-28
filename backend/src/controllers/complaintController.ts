import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Complaint from '../models/Complaint';
import User from '../models/User';
import { generateComplaintPDF } from '../services/pdfService';
import { generateIncidentHash } from '../services/blockchainService';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcyberjwttoken123!';

interface AuthRequest extends Request {
  user?: { id: string };
}

/**
 * Helper to extract user identity from JWT token or request fallback.
 */
const resolveUserIdentity = async (req: Request): Promise<{ userId: string | null; userName: string }> => {
  const token = req.headers.authorization?.split(' ')[1];
  let userId = req.body.userId || null;
  let userName = 'Anonymous Citizen';

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = await User.findById(decoded.id);
      if (user) {
        userId = user._id.toString();
        userName = user.name;
      }
    } catch (err) {
      console.warn('[AUTH] Failed to decode token during complaint creation:', err);
    }
  } else if (userId) {
    try {
      const user = await User.findById(userId);
      if (user) {
        userName = user.name;
      }
    } catch (err) {
      console.warn('[DATABASE] Failed to find user by body userId:', err);
    }
  }

  return { userId, userName };
};

/**
 * Creates a complaint in the database, generates the official PDF,
 * and saves the binary PDF Buffer inside the document.
 */
export const createComplaint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { incidentType, description, dateOfIncident, financialLoss, platform, suspectDetails } = req.body;

    if (!incidentType || !description || !dateOfIncident) {
      res.status(400).json({ error: 'Missing required fields: incidentType, description, and dateOfIncident are required.' });
      return;
    }

    const { userId, userName } = await resolveUserIdentity(req);

    // Fallback user if completely anonymous/test to avoid validation error
    let assignedUserId = userId;
    if (!assignedUserId) {
      // Find the first registered user in the database to act as the filer, or default
      const defaultUser = await User.findOne();
      if (defaultUser) {
        assignedUserId = defaultUser._id.toString();
      } else {
        res.status(400).json({ error: 'User context is required. Please register/log in or create a user in the database.' });
        return;
      }
    }

    // 1. Generate Blockchain Integrity Signature
    const blockchainHash = generateIncidentHash(
      assignedUserId,
      incidentType,
      'HIGH', // Default severity level for complaints
      new Date()
    );

    // 2. Instantiate Complaint Object
    const complaint = new Complaint({
      userId: assignedUserId,
      incidentType,
      description,
      dateOfIncident: new Date(dateOfIncident),
      financialLoss: Number(financialLoss) || 0,
      platform,
      suspectDetails,
      blockchainHash,
      status: 'PENDING'
    });

    // 3. Compile PDF in-memory
    const pdfBuffer = await generateComplaintPDF(complaint, userName);

    // 4. Attach binary Buffer to the complaint document
    complaint.pdfData = pdfBuffer;

    // 5. Save to MongoDB
    await complaint.save();

    // 6. Respond with metadata, omitting the heavy binary buffer
    const responseObj = complaint.toObject();
    delete responseObj.pdfData;

    res.status(201).json({
      message: 'Complaint filed successfully and PDF compiled inside MongoDB.',
      complaint: responseObj
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({ error: 'Internal server error during complaint registration.' });
  }
};

/**
 * Streams the PDF stored inside MongoDB directly to the client.
 */
export const getComplaintPdf = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint || !complaint.pdfData) {
      res.status(404).json({ error: 'Complaint or associated PDF document not found.' });
      return;
    }

    // Set PDF content headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="complaint-${id}.pdf"`);
    res.setHeader('Content-Length', complaint.pdfData.length);

    // Write binary buffer to response
    res.send(complaint.pdfData);
  } catch (error) {
    console.error('Error streaming complaint PDF:', error);
    res.status(500).json({ error: 'Internal server error retrieving PDF.' });
  }
};

/**
 * Gets a list of complaints filed by the current user.
 */
export const getComplaints = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = await resolveUserIdentity(req);

    if (!userId) {
      res.status(401).json({ error: 'Authentication required to view complaint history.' });
      return;
    }

    // Retrieve complaints, projecting out the heavy pdfData buffer for network performance
    const complaints = await Complaint.find({ userId })
      .select('-pdfData')
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({ error: 'Internal server error fetching complaint logs.' });
  }
};
