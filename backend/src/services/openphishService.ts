import { Server } from 'socket.io';
import https from 'https';

export interface PhishingThreat {
  id: string;
  url: string;
  domain: string;
  brand: string;
  severity: 'CRITICAL' | 'WARNING' | 'SECURED';
  timestamp: string;
  details: string;
}

let cachedThreats: PhishingThreat[] = [];
let mockFallbackThreats: PhishingThreat[] = [
  {
    id: 'mock-1',
    url: 'http://sbi-netbanking-secure.com/login.html',
    domain: 'sbi-netbanking-secure.com',
    brand: 'State Bank of India',
    severity: 'CRITICAL',
    timestamp: new Date().toISOString(),
    details: 'Fake netbanking page stealing login credentials and OTPs.'
  },
  {
    id: 'mock-2',
    url: 'http://secure-paypal-update.net/webapps/mpp/home',
    domain: 'secure-paypal-update.net',
    brand: 'PayPal',
    severity: 'CRITICAL',
    timestamp: new Date().toISOString(),
    details: 'Credential harvester targeting PayPal accounts.'
  },
  {
    id: 'mock-3',
    url: 'https://netflix-payment-verification.org/billing',
    domain: 'netflix-payment-verification.org',
    brand: 'Netflix',
    severity: 'WARNING',
    timestamp: new Date().toISOString(),
    details: 'Phishing domain soliciting credit card update info.'
  },
  {
    id: 'mock-4',
    url: 'http://hDFC-online-kyc-check.com/secure',
    domain: 'hDFC-online-kyc-check.com',
    brand: 'HDFC Bank',
    severity: 'CRITICAL',
    timestamp: new Date().toISOString(),
    details: 'Fraudulent portal attempting KYC data collection.'
  },
  {
    id: 'mock-5',
    url: 'https://metamask-security-alert.io/restore',
    domain: 'metamask-security-alert.io',
    brand: 'MetaMask',
    severity: 'CRITICAL',
    timestamp: new Date().toISOString(),
    details: 'Crypto wallet phishing page attempting to harvest seed phrases.'
  }
];

// Helper function to extract domain from URL
function getDomain(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    return url.hostname;
  } catch (e) {
    // If not a valid absolute URL, try parsing manually
    const match = urlStr.match(/^(?:https?:\/\/)?([^/]+)/i);
    return match ? match[1] : urlStr;
  }
}

// Helper function to detect brand based on keywords in URL
function detectBrand(urlStr: string): string {
  const urlLower = urlStr.toLowerCase();
  if (urlLower.includes('sbi') || urlLower.includes('statebank')) return 'State Bank of India';
  if (urlLower.includes('paypal')) return 'PayPal';
  if (urlLower.includes('netflix')) return 'Netflix';
  if (urlLower.includes('hdfc')) return 'HDFC Bank';
  if (urlLower.includes('icici')) return 'ICICI Bank';
  if (urlLower.includes('microsoft') || urlLower.includes('outlook') || urlLower.includes('live.')) return 'Microsoft';
  if (urlLower.includes('google') || urlLower.includes('gmail')) return 'Google';
  if (urlLower.includes('amazon')) return 'Amazon';
  if (urlLower.includes('metamask')) return 'MetaMask';
  if (urlLower.includes('apple') || urlLower.includes('icloud')) return 'Apple';
  if (urlLower.includes('facebook') || urlLower.includes('meta')) return 'Facebook';
  
  // Return generic or derive from domain
  const domain = getDomain(urlStr);
  const parts = domain.split('.');
  if (parts.length > 1) {
    const name = parts[parts.length - 2];
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  return 'Unknown';
}

// Helper function to make an HTTPS GET request and return the body (follows redirects)
function fetchUrlContent(urlStr: string, depth = 0): Promise<string> {
  if (depth > 3) {
    return Promise.reject(new Error('Too many redirects'));
  }
  return new Promise((resolve, reject) => {
    const req = https.get(urlStr, { timeout: 5000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location;
        if (redirectUrl) {
          const nextUrl = redirectUrl.startsWith('http') 
            ? redirectUrl 
            : new URL(redirectUrl, urlStr).toString();
          resolve(fetchUrlContent(nextUrl, depth + 1));
          return;
        }
      }
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to load page, status code: ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
  });
}

// Fetch OpenPhish feed securely
export async function fetchOpenPhishFeed(): Promise<PhishingThreat[]> {
  const primaryUrl = 'https://openphish.com/feed.txt';
  const fallbackUrl = 'https://raw.githubusercontent.com/openphish/public_feed/refs/heads/main/feed.txt';
  
  let data = '';
  try {
    console.log('[OPENPHISH] Attempting to fetch directly from openphish.com...');
    data = await fetchUrlContent(primaryUrl);
  } catch (primaryErr: any) {
    console.warn(`[OPENPHISH] Direct fetch failed: ${primaryErr.message || primaryErr}. Trying fallback mirror...`);
    try {
      data = await fetchUrlContent(fallbackUrl);
    } catch (fallbackErr: any) {
      console.error(`[OPENPHISH] Fallback mirror fetch failed: ${fallbackErr.message || fallbackErr}. Using mock threats.`);
      return mockFallbackThreats;
    }
  }

  const lines = data.split('\n').filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    console.warn('[OPENPHISH] Feed returned empty list. Using mock fallbacks.');
    return mockFallbackThreats;
  }

  const threats: PhishingThreat[] = lines.slice(0, 100).map((url, index) => {
    const domain = getDomain(url);
    const brand = detectBrand(url);
    return {
      id: `op-${index}-${Date.now()}`,
      url,
      domain,
      brand,
      severity: Math.random() > 0.3 ? 'CRITICAL' : 'WARNING',
      timestamp: new Date().toISOString(),
      details: `Active phishing campaign targeting ${brand} users at ${domain}.`
    };
  });

  console.log(`[OPENPHISH] Successfully loaded ${threats.length} phishing URLs.`);
  return threats;
}

// Retrieve cached threats
export function getLatestPhishingThreats(): PhishingThreat[] {
  return cachedThreats.length > 0 ? cachedThreats.slice(0, 20) : mockFallbackThreats;
}

// Initialize and start streaming
export function startOpenPhishStreaming(io: Server) {
  // Initial fetch
  fetchOpenPhishFeed().then(threats => {
    cachedThreats = threats;
  });

  // Fetch feed every 30 minutes to stay updated
  setInterval(async () => {
    const threats = await fetchOpenPhishFeed();
    if (threats.length > 0) {
      cachedThreats = threats;
    }
  }, 30 * 60 * 1000);

  // Broadcast loop: Emit a new alert to frontend every 7 seconds to simulate real-time feed
  let index = 0;
  setInterval(() => {
    const list = cachedThreats.length > 0 ? cachedThreats : mockFallbackThreats;
    if (list.length === 0) return;

    const baseThreat = list[index % list.length];
    // Create a fresh alert with current timestamp
    const alertEmit: PhishingThreat = {
      ...baseThreat,
      id: `${baseThreat.id}-${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    io.emit('phishing-alert', alertEmit);
    console.log(`[OPENPHISH-STREAM] Emitted alert: ${alertEmit.domain}`);
    index++;
  }, 7000);
}
