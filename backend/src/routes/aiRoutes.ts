import { Router } from 'express';
import { scanImage, analyzeText, verifyBlockchain } from '../controllers/aiController';

const router = Router();

router.post('/scan-image', scanImage);
router.post('/analyze-text', analyzeText);
router.post('/verify-blockchain', verifyBlockchain);

export default router;
