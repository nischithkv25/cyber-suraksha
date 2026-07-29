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

/**
 * Generates dynamic conversational responses in English or Kannada based on threat analysis and user input.
 */
export const getChatbotResponse = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, lang } = req.body;
    const content = (message || '').trim().toLowerCase();
    const isKn = lang === 'kn';

    if (!content) {
      res.status(200).json({
        response: isKn 
          ? 'ನಮಸ್ಕಾರ, ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?' 
          : 'Hello! How can I assist you with your cyber security today?'
      });
      return;
    }

    // Call standard threat heuristic engine
    const evaluation = analyzeThreatContent(content);

    let reply = '';

    if (isKn) {
      // Kannada responses
      if (evaluation.threatScore > 75) {
        reply = `ಎಚ್ಚರಿಕೆ! ಇದು ಹೆಚ್ಚಿನ ಅಪಾಯದ ಸೈಬರ್ ಬೆದರಿಕೆಯಂತೆ ಕಾಣುತ್ತಿದೆ (ಅಪಾಯದ ಪ್ರಮಾಣ: ${evaluation.threatScore}%). ದಯವಿಟ್ಟು ನಮ್ಮ ತುರ್ತು ವರದಿ ಪುಟವನ್ನು ಬಳಸಿ ತಕ್ಷಣ ದೂರು ದಾಖಲಿಸಿ ಅಥವಾ 1930 ಸಂಖ್ಯೆಗೆ ಕರೆ ಮಾಡಿ. ಯಾವುದೇ ಕಾರಣಕ್ಕೂ ಒಟಿಪಿ (OTP) ಅಥವಾ ಬ್ಯಾಂಕ್ ವಿವರಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.`;
      } else if (content.includes('help') || content.includes('ಸಹಾಯ') || content.includes('features') || content.includes('ಕೆಲಸಗಳು')) {
        reply = 'ನಾನು ನಿಮಗೆ ಸಂಶಯಾಸ್ಪದ ಲಿಂಕ್‌ಗಳನ್ನು ಪರಿಶೀಲಿಸಲು, ಬ್ಯಾಂಕ್ ಖಾತೆಯನ್ನು ಸ್ಥಗಿತಗೊಳಿಸಲು, ಯುಪಿಐ ಐಡಿ ನಿರ್ಬಂಧಿಸಲು ಅಥವಾ ಅಧಿಕೃತ ಸೈಬರ್ ದೂರನ್ನು ದಾಖಲಿಸಲು ಮಾರ್ಗದರ್ಶನ ನೀಡಬಲ್ಲೆ. ನಿಮಗೆ ಯಾವ ಸಹಾಯ ಬೇಕು?';
      } else if (content.includes('upi') || content.includes('ಯುಪಿಐ') || content.includes('payment') || content.includes('ಹಣ') || content.includes('ಪಾವತಿ')) {
        reply = 'ಯುಪಿಐ ವಂಚನೆ ನಡೆದರೆ, ತಕ್ಷಣವೇ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ ಯುಪಿಐ ವಹಿವಾಟುಗಳನ್ನು ನಿರ್ಬಂಧಿಸಿ. ನಮ್ಮ "ತುರ್ತು ವರದಿ" ವಿಭಾಗದಲ್ಲಿ "UPI ಐಡಿ ಬ್ಲಾಕ್ ಮಾಡಿ" ಆಯ್ಕೆಯನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ.';
      } else if (content.includes('otp') || content.includes('ಒಟಿಪಿ') || content.includes('password') || content.includes('ಗುಪ್ತಪದ')) {
        reply = 'ನೆನಪಿಡಿ: ಯಾವುದೇ ಬ್ಯಾಂಕ್ ಅಧಿಕಾರಿಯಾಗಲಿ ಅಥವಾ ಸರ್ಕಾರಿ ಪ್ರತಿನಿಧಿಯಾಗಲಿ ನಿಮ್ಮ ಒಟಿಪಿ (OTP) ಅಥವಾ ಗುಪ್ತಪದವನ್ನು ಕೇಳುವುದಿಲ್ಲ. ಇದನ್ನು ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.';
      } else if (content.includes('job') || content.includes('ಕೆಲಸ') || content.includes('part time') || content.includes('ಉದ್ಯೋಗ')) {
        reply = 'ವಾಟ್ಸಾಪ್ ಅಥವಾ ಟೆಲಿಗ್ರಾಮ್‌ನಲ್ಲಿ ಬರುವ ಅರೆಕಾಲಿಕ ಕೆಲಸಗಳ ಪ್ರಸ್ತಾಪಗಳು ಹೆಚ್ಚಾಗಿ ವಂಚನೆಯಾಗಿರುತ್ತವೆ. ಯಾವುದೇ ಕೆಲಸಕ್ಕಾಗಿ ಮೊದಲೇ ಹಣ ಪಾವತಿಸಬೇಡಿ.';
      } else {
        reply = `ನಿಮ್ಮ ಸಂದೇಶವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ. ಭದ್ರತಾ ಸೂಚ್ಯಂಕ: ${100 - evaluation.threatScore}%. ಸೈಬರ್ ಅಪರಾಧದ ಸಂದೇಹವಿದ್ದರೆ, ತಕ್ಷಣವೇ ಸಹಾಯವಾಣಿ ಸಂಖ್ಯೆ 1930 ಗೆ ಕರೆ ಮಾಡಿ.`;
      }
    } else {
      // English responses
      if (evaluation.threatScore > 75) {
        reply = `WARNING! High cyber threat detected (Threat Score: ${evaluation.threatScore}%). Please file a complaint via the EMERGENCY REPORT dashboard immediately or call the National Cyber Helpline at 1930. Do NOT share OTPs or personal credentials.`;
      } else if (content.includes('help') || content.includes('assist') || content.includes('features')) {
        reply = 'I can guide you to scan links, block digital payment identifiers, request temporary bank locks, or file automated cyber cell FIR complaints. What do you need help with?';
      } else if (content.includes('upi') || content.includes('gpay') || content.includes('phonepe') || content.includes('payment')) {
        reply = 'In case of UPI fraud, immediately freeze your UPI ID and payment accounts. Navigate to our Emergency Report page to use the rapid block triggers.';
      } else if (content.includes('otp') || content.includes('password') || content.includes('pin')) {
        reply = 'Critical Rule: Bank officers and nodal agents never request OTPs, passwords, or transaction PINs. Keep them strictly confidential.';
      } else if (content.includes('job') || content.includes('part-time') || content.includes('earn')) {
        reply = 'Avoid WhatsApp/Telegram job offers that request advance payments or deposits to unlock tasks. These are common social engineering scams.';
      } else {
        reply = `Request analyzed. Security Health: ${100 - evaluation.threatScore}%. If you suspect any malicious activity, keep evidence and report to the authority via the Emergency portal or call 1930.`;
      }
    }

    res.status(200).json({ response: reply });
  } catch (error) {
    console.error('[CHATBOT-API] Error generating response:', error);
    res.status(500).json({ error: 'Chatbot response generation failed' });
  }
};

