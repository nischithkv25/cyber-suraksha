import { Router } from 'express';
import { createComplaint, getComplaintPdf, getComplaints } from '../controllers/complaintController';

const router = Router();

// Routes prefix: /api/complaints
router.post('/', createComplaint);
router.get('/', getComplaints);
router.get('/:id/pdf', getComplaintPdf);

export default router;
