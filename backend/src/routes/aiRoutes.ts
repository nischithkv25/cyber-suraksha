import { Router } from 'express';
import multer from 'multer';
import { scanImage, analyzeText, verifyBlockchain } from '../controllers/aiController';

const upload = multer({ dest: 'uploads/' });
const router = Router();

// Routes mapping: /api/ai
router.post('/scan-image', upload.single('image'), scanImage);
router.post('/analyze-text', analyzeText);
router.post('/verify-blockchain', verifyBlockchain);

export default router;
