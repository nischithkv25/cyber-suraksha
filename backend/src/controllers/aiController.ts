import { Request, Response } from 'express';
import { analyzeThreatContent } from '../services/aiThreatEngine';

/**
 * Analyzes uploaded evidence (image/dossier file metadata) for scam indicators.
 */
export const scanImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const textToAnalyze = req.body.text || req.file?.originalname || 'Suspicious screenshot evidence';
    
    // Perform heuristic threat evaluation
    const result = analyzeThreatContent(textToAnalyze);

    setTimeout(() => {
      res.status(200).json(result);
    }, 1500); // Simulate neural network processing latency
  } catch (error) {
    console.error('[AI-SCAN] Error scanning image:', error);
    res.status(500).json({ error: 'AI processing failed' });
  }
};

/**
 * Analyzes user-submitted message body text or suspect URLs.
 */
export const analyzeText = async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    
    // Perform heuristic threat evaluation
    const result = analyzeThreatContent(text);

    setTimeout(() => {
      res.status(200).json(result);
    }, 1000); // Simulate pattern matcher processing latency
  } catch (error) {
    console.error('[AI-SCAN] Error analyzing text:', error);
    res.status(500).json({ error: 'AI text analysis failed' });
  }
};

/**
 * Verification point for blockchain hashes (keeps existing logic).
 */
export const verifyBlockchain = async (req: Request, res: Response): Promise<void> => {
  try {
    const { hash } = req.body;

    setTimeout(() => {
      res.status(200).json({
        verified: true,
        timestamp: new Date().toISOString(),
        network: 'Ethereum Mainnet',
        blockNumber: 15423899
      });
    }, 1200);
  } catch (error) {
    console.error('[BLOCKCHAIN] Error verifying hash:', error);
    res.status(500).json({ error: 'Blockchain verification failed' });
  }
};
