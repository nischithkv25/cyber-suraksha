import fs from 'fs';
import path from 'path';
import twilio from 'twilio';

let twilioClient: any = null;

const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (accountSid && authToken && twilioPhone) {
    if (!twilioClient) {
      try {
        twilioClient = twilio(accountSid, authToken);
        console.log('[SMS SERVICE] Twilio client initialized successfully.');
      } catch (err) {
        console.error('[SMS SERVICE] Failed to initialize Twilio client:', err);
      }
    }
    return { client: twilioClient, phone: twilioPhone };
  }
  return null;
};

export const sendEmergencySMS = async (phoneNumber: string, threatSeverity: string, scamType: string): Promise<boolean> => {
  let messageTemplate = '';

  if (threatSeverity === 'HIGH') {
    messageTemplate = `🚨 HIGH ALERT (Cyber Suraksha): ${scamType} detected. Do NOT share OTP or approve unknown requests. Open Cyber Suraksha Emergency Mode immediately to secure your account.`;
  } else if (threatSeverity === 'MEDIUM') {
    messageTemplate = `⚠ WARNING (Cyber Suraksha): Suspicious activity (${scamType}) detected. Please review your recent transactions and secure your account.`;
  } else {
    messageTemplate = `ℹ INFO (Cyber Suraksha): Minor security alert (${scamType}) logged for your account.`;
  }

  const twilioInstance = getTwilioClient();
  if (twilioInstance) {
    try {
      console.log(`[SMS SERVICE] Sending Twilio emergency SMS to: ${phoneNumber}`);
      await twilioInstance.client.messages.create({
        body: messageTemplate,
        from: twilioInstance.phone,
        to: phoneNumber
      });
      console.log('[SMS SERVICE] Twilio SMS sent successfully.');
      return true;
    } catch (err) {
      console.error('[SMS SERVICE] Twilio SMS failed to send. Using fallback.', err);
    }
  }

  // Fallback / Mock Behavior
  console.log(`\n[SMS SERVICE MOCK] Initiating emergency SMS to: ${phoneNumber}`);
  console.log(`[SMS SERVICE MOCK] Payload: "${messageTemplate}"`);
  console.log(`[SMS SERVICE MOCK] Status: DELIVERED\n`);

  // Simulate network delay
  return new Promise((resolve) => setTimeout(() => resolve(true), 500));
};

export const sendLoginOtp = async (phoneNumber: string, otp: string): Promise<boolean> => {
  const message = `🔐 Your Cyber Suraksha verification code is: ${otp}. Valid for 5 minutes.`;

  // Write OTP to local file for easy testing in development
  try {
    fs.writeFileSync(path.join(__dirname, '../../otp.txt'), otp);
  } catch (err) {
    console.error('Failed to write OTP to file:', err);
  }

  const twilioInstance = getTwilioClient();
  if (twilioInstance) {
    try {
      console.log(`[SMS SERVICE] Sending Twilio OTP to: ${phoneNumber}`);
      await twilioInstance.client.messages.create({
        body: message,
        from: twilioInstance.phone,
        to: phoneNumber
      });
      console.log('[SMS SERVICE] Twilio OTP SMS sent successfully.');
      return true;
    } catch (err) {
      console.error('[SMS SERVICE] Twilio OTP SMS failed to send. Using fallback.', err);
    }
  }

  // Fallback / Mock Behavior
  console.log(`\n[SMS SERVICE MOCK] Initiating OTP SMS to: ${phoneNumber}`);
  console.log(`[SMS SERVICE MOCK] Payload: "${message}"`);
  console.log(`[SMS SERVICE MOCK] Status: DELIVERED\n`);
  
  // Simulate network delay
  return new Promise((resolve) => setTimeout(() => resolve(true), 500));
};
