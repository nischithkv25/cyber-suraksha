export const evaluateThreatSeverity = (scamType: string, confidenceScore: number): 'LOW' | 'MEDIUM' | 'HIGH' => {
  // Simple heuristic for threat scoring based on keywords and confidence
  const highRiskKeywords = ['UPI', 'OTP', 'BANK', 'FINANCIAL', 'RANSOMWARE', 'CREDIT CARD', 'PHISHING'];
  const mediumRiskKeywords = ['LOTTERY', 'JOB', 'PRIZE', 'SOCIAL MEDIA', 'IMPERSONATION'];

  const upperScamType = scamType.toUpperCase();

  const isHighRisk = highRiskKeywords.some(keyword => upperScamType.includes(keyword));
  const isMediumRisk = mediumRiskKeywords.some(keyword => upperScamType.includes(keyword));

  if (isHighRisk && confidenceScore >= 0.8) {
    return 'HIGH';
  } else if ((isHighRisk && confidenceScore < 0.8) || (isMediumRisk && confidenceScore >= 0.7)) {
    return 'MEDIUM';
  } else {
    return 'LOW';
  }
};
