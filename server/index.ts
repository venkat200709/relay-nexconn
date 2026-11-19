import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const appKey = process.env.NEXCONN_APP_KEY || '';
const appSecret = process.env.NEXCONN_APP_SECRET || '';
const apiHost = process.env.NEXCONN_API_HOST || 'api.sg-light-api.com';
const dataCenter = process.env.NEXCONN_DATA_CENTER || 'Singapore';

export interface HelpRequest {
  id: string;
  category: 'Medicine' | 'Groceries' | 'Ride' | 'Translation' | 'Elder Check-in' | 'Household Fix' | 'Pet Care' | 'Urgent Alert';
  urgency: 'high' | 'medium' | 'normal';
  title: string;
  description: string;
  location: string;
  requesterId: string;
  requesterName: string;
  requesterAvatar: string;
  volunteerId?: string;
  volunteerName?: string;
  volunteerAvatar?: string;
  status: 'open' | 'claimed' | 'in_progress' | 'resolved';
  createdAt: number;
  claimedAt?: number;
  resolvedAt?: number;
  resolutionSummary?: string;
  rating?: number;
  feedback?: string;
}

const INITIAL_REQUESTS: HelpRequest[] = [
  {
    id: 'req-elder-101',
    category: 'Medicine',
    urgency: 'high',
    title: 'Blood pressure medication pickup from Apollo Pharmacy',
    description: 'My grandmother Eleanor (78) ran out of Amlodipine 5mg. Prescription slip is at the front desk. She cannot walk in the rain.',
    location: 'Oakridge Residences, Apt 402, 3rd Avenue',
    requesterId: 'user-requester-eleanor',
    requesterName: 'Eleanor Vance',
    requesterAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'open',
    createdAt: Date.now() - 14 * 60 * 1000,
  },
  {
    id: 'req-ride-102',
    category: 'Ride',
    urgency: 'medium',
    title: 'Ride to City Hospital for 3:30 PM dialysis checkup',
    description: 'Need a calm driver with space for a folding walker. Wheelchair accessible trunk preferred.',
    location: 'Pinecrest Community Center, Gate 2',
    requesterId: 'user-requester-marcus',
    requesterName: 'Marcus Chen',
    requesterAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'open',
    createdAt: Date.now() - 42 * 60 * 1000,
  },
  {
    id: 'req-groceries-103',
    category: 'Groceries',
    urgency: 'normal',
    title: 'Fresh milk, wholemeal bread, and baby formula',
    description: 'Homebound with a newborn toddler with mild fever. Will reimburse via cash or digital transfer upon delivery.',
    location: 'Greenwood Heights, Block C #12',
    requesterId: 'user-requester-sarah',
    requesterName: 'Sarah Jenkins',
    requesterAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'open',
    createdAt: Date.now() - 85 * 60 * 1000,
  },
  {
    id: 'req-trans-104',
    category: 'Translation',
    urgency: 'medium',
    title: 'Need help understanding hospital insurance discharge form',
    description: 'Recently moved here; form is in formal legal English. Need 15 mins to translate the key follow-up care instructions.',
    location: 'Westfield Library Courtyard',
    requesterId: 'user-requester-mateo',
    requesterName: 'Mateo Rossi',
    requesterAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'claimed',
    volunteerId: 'user-volunteer-sasmita',
    volunteerName: 'Sasmita (Hexcore)',
    volunteerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    claimedAt: Date.now() - 25 * 60 * 1000,
    createdAt: Date.now() - 110 * 60 * 1000,
  },
  {
    id: 'req-fix-105',
    category: 'Household Fix',
    urgency: 'normal',
    title: 'Water pipe valve stuck under kitchen sink',
    description: 'Small drip from the valve joint. Just need an adjustable wrench and 5 minutes to tighten the brass nut.',
    location: 'Sunrise Gardens, Unit 18B',
    requesterId: 'user-requester-dorothy',
    requesterName: 'Dorothy Wright',
    requesterAvatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    status: 'resolved',
    volunteerId: 'user-volunteer-venkat',
    volunteerName: 'Venkatesan (Hexcore)',
    volunteerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: Date.now() - 180 * 60 * 1000,
    claimedAt: Date.now() - 140 * 60 * 1000,
    resolvedAt: Date.now() - 60 * 60 * 1000,
    resolutionSummary: 'Pipe securely tightened with silicone washer. No further leaks detected.',
    rating: 5,
    feedback: 'Venkatesan arrived in 10 minutes and solved the issue quickly! Very grateful.',
  }
];

let requests: HelpRequest[] = JSON.parse(JSON.stringify(INITIAL_REQUESTS));

app.get('/api/config', (_req, res) => {
  res.json({
    appKey,
    dataCenter,
    apiHost,
  });
});

app.post('/api/auth/token', async (req, res) => {
  try {
    const { userId, name, avatarUrl } = req.body;

    if (!userId || !name) {
      return res.status(400).json({ error: 'userId and name are required' });
    }

    if (!appKey || !appSecret) {
      return res.status(500).json({ error: 'Nexconn credentials not configured on server' });
    }

    const nonce = Math.floor(Math.random() * 1000000).toString();
    const timestamp = Date.now().toString();

    const hash = crypto.createHash('sha1');
    hash.update(appSecret + nonce + timestamp);
    const signature = hash.digest('hex');

    const response = await fetch(`https://${apiHost}/v4/auth/access-token/issue`, {
      method: 'POST',
      headers: {
        'App-Key': appKey,
        'Nonce': nonce,
        'Timestamp': timestamp,
        'Signature': signature,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        name,
        avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
      }),
    });

    const data = (await response.json()) as { code: number; result?: { userId: string; accessToken: string }; msg?: string };

    if (data.code !== 0 || !data.result?.accessToken) {
      return res.status(502).json({
        error: 'Failed to issue token from Nexconn platform',
        details: data,
      });
    }

    return res.json({
      userId: data.result.userId,
      token: data.result.accessToken,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Token generation error',
      message: error?.message || 'Unknown error',
    });
  }
});

app.get('/api/requests', (_req, res) => {
  res.json({ requests });
});

app.post('/api/requests', (req, res) => {
  const { category, urgency, title, description, location, requesterId, requesterName, requesterAvatar } = req.body;

  if (!category || !urgency || !title || !description || !requesterId) {
    return res.status(400).json({ error: 'Missing required request fields' });
  }

  const newRequest: HelpRequest = {
    id: `req-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    category,
    urgency,
    title,
    description,
    location: location || 'Neighbourhood Area',
    requesterId,
    requesterName: requesterName || 'Neighbour',
    requesterAvatar: requesterAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${requesterId}`,
    status: 'open',
    createdAt: Date.now(),
  };

  requests.unshift(newRequest);
  res.status(201).json({ request: newRequest });
});

app.patch('/api/requests/:id/claim', (req, res) => {
  const { id } = req.params;
  const { volunteerId, volunteerName, volunteerAvatar } = req.body;

  const item = requests.find((r) => r.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (item.status !== 'open') {
    return res.status(400).json({ error: `Request already ${item.status}` });
  }

  item.status = 'claimed';
  item.volunteerId = volunteerId;
  item.volunteerName = volunteerName;
  item.volunteerAvatar = volunteerAvatar;
  item.claimedAt = Date.now();

  res.json({ request: item });
});

app.patch('/api/requests/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, resolutionSummary } = req.body;

  const item = requests.find((r) => r.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Request not found' });
  }

  if (status === 'in_progress') {
    item.status = 'in_progress';
  } else if (status === 'resolved') {
    item.status = 'resolved';
    item.resolvedAt = Date.now();
    if (resolutionSummary) {
      item.resolutionSummary = resolutionSummary;
    }
  }

  res.json({ request: item });
});

app.post('/api/requests/:id/rate', (req, res) => {
  const { id } = req.params;
  const { rating, feedback } = req.body;

  const item = requests.find((r) => r.id === id);
  if (!item) {
    return res.status(404).json({ error: 'Request not found' });
  }

  item.rating = rating;
  item.feedback = feedback;

  res.json({ request: item });
});

app.post('/api/requests/reset', (_req, res) => {
  requests = JSON.parse(JSON.stringify(INITIAL_REQUESTS));
  res.json({ success: true, count: requests.length });
});

if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Relay Backend running on http://localhost:${PORT}`);
});
