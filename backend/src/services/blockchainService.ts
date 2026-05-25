import crypto from 'crypto';

export const generateIncidentHash = (userId: string, scamType: string, threatSeverity: string, timestamp: Date): string => {
  // Create a predictable string payload from the incident data
  const payload = `${userId}|${scamType}|${threatSeverity}|${timestamp.toISOString()}`;
  
  // Generate a SHA256 hash to act as an immutable integrity signature
  const hash = crypto.createHash('sha256').update(payload).digest('hex');
  
  return hash;
};
