import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import path from 'node:path';
import { applicationDefault, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { Pool } from 'pg';
import { ZodError, z } from 'zod';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || '';
const ADMIN_SESSION_COOKIE = 'runfourcode_admin';
const ADMIN_SESSION_DURATION_MS = 8 * 60 * 60 * 1000;
const db = new Pool({ connectionString: process.env.DATABASE_URL });
let lastRateLimitCleanup = 0;

interface ApiIdentity {
  uid: string;
  email: string | null;
  isAdmin: boolean;
}

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to start the API server.');
}
if (!FIREBASE_PROJECT_ID) {
  throw new Error('FIREBASE_PROJECT_ID is required to verify Firebase Authentication tokens.');
}

const firebaseApp = getApps()[0] || initializeApp({
  credential: applicationDefault(),
  projectId: FIREBASE_PROJECT_ID,
});
const firebaseAuth = getAuth(firebaseApp);
const inquiryColumns = `id, uid, name, email, phone, website, project_type AS "projectType",
  budget, idea, status, deployed_url AS "deployedUrl", created_at AS "createdAt", updated_at AS "updatedAt"`;
const contentDefaults = {
  heroTitle: 'BUILD. DEVELOP. GROW.',
  heroSubtitle: 'We turn ideas into real digital systems — from strategy and design to development, launch, and growth.',
  positioningHeadline: 'Your idea is only the beginning.',
  positioningBody: 'Ideas are easy. Building systems that actually work, scale under load, and solve real organizational problems is the real work.',
  services: [],
};

const inquiryCreateSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(150),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  website: z.string().trim().max(200).optional().or(z.literal('')),
  projectType: z.string().trim().min(1).max(100),
  budget: z.string().trim().max(50).optional().or(z.literal('')),
  idea: z.string().trim().min(1).max(2000),
}).strict();
const messageSchema = z.object({ message: z.string().trim().min(1).max(1000) }).strict();
const inquiryUpdateSchema = z.object({
  status: z.enum(['NEW', 'REPLIED', 'IN PROGRESS', 'CLOSED']).optional(),
  deployedUrl: z.string().trim().max(200).url().refine((url) => /^https?:\/\//i.test(url)).or(z.literal('')).optional(),
}).strict().refine((data) => data.status !== undefined || data.deployedUrl !== undefined);
const siteContentSchema = z.object({
  heroTitle: z.string().trim().min(1).max(200),
  heroSubtitle: z.string().trim().max(1000),
  positioningHeadline: z.string().trim().min(1).max(300),
  positioningBody: z.string().trim().max(2000),
  services: z.array(z.object({
    id: z.string().max(100),
    number: z.string().max(20),
    title: z.string().max(200),
    shortDesc: z.string().max(1000),
    fullDesc: z.string().max(2000),
    deliverables: z.array(z.string().max(300)).max(30),
    icon: z.string().max(100),
  }).strict()).max(30),
}).strict();
const aiRequestSchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
  logs: z.unknown().optional(),
}).strict();

const adminLoginSchema = z.object({
  email: z.string().trim().email().max(150),
  password: z.string().min(1).max(200),
}).strict();

function isAdmin(identity: ApiIdentity) {
  return identity.isAdmin;
}

function asyncRoute(handler: (req: Request, res: Response) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res)).catch(next);
  };
}

function readAdminSession(req: Request): ApiIdentity | null {
  if (!ADMIN_EMAIL || !ADMIN_SESSION_SECRET) return null;
  const cookieHeader = req.get('cookie') || '';
  const cookie = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  const token = cookie?.slice(ADMIN_SESSION_COOKIE.length + 1);
  if (!token) return null;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  const expectedSignature = createHmac('sha256', ADMIN_SESSION_SECRET).update(payload).digest();
  let providedSignature: Buffer;
  try {
    providedSignature = Buffer.from(signature, 'base64url');
  } catch {
    return null;
  }
  if (providedSignature.length !== expectedSignature.length || !timingSafeEqual(providedSignature, expectedSignature)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { email?: string; expiresAt?: number };
    if (session.email !== ADMIN_EMAIL || !session.expiresAt || session.expiresAt <= Date.now()) return null;
    return { uid: `admin:${ADMIN_EMAIL}`, email: ADMIN_EMAIL, isAdmin: true };
  } catch {
    return null;
  }
}

function signAdminSession() {
  const payload = Buffer.from(JSON.stringify({
    email: ADMIN_EMAIL,
    expiresAt: Date.now() + ADMIN_SESSION_DURATION_MS,
  })).toString('base64url');
  const signature = createHmac('sha256', ADMIN_SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function setAdminSessionCookie(res: Response, value: string) {
  res.cookie(ADMIN_SESSION_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api',
    maxAge: ADMIN_SESSION_DURATION_MS,
  });
}

function clearAdminSessionCookie(res: Response) {
  res.clearCookie(ADMIN_SESSION_COOKIE, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api',
  });
}

async function verifyIdentity(req: Request, res: Response) {
  const adminSession = readAdminSession(req);
  if (adminSession) {
    res.locals.identity = adminSession;
    return adminSession;
  }

  const authorization = req.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Sign in is required.' });
    return null;
  }
  try {
    const identity = await firebaseAuth.verifyIdToken(authorization.slice(7), true);
    const clientIdentity: ApiIdentity = {
      uid: identity.uid,
      email: identity.email || null,
      isAdmin: false,
    };
    res.locals.identity = clientIdentity;
    return clientIdentity;
  } catch {
    res.status(401).json({ error: 'Your session is invalid or expired. Please sign in again.' });
    return null;
  }
}

function requireUser(req: Request, res: Response, next: NextFunction) {
  verifyIdentity(req, res).then((identity) => {
    if (identity) next();
  }).catch(next);
}

function requireOptionalUser(req: Request, res: Response, next: NextFunction) {
  const authorization = req.get('authorization');
  if (!authorization) {
    next();
    return;
  }
  verifyIdentity(req, res).then((identity) => {
    if (identity) next();
  }).catch(next);
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const identity = readAdminSession(req);
  if (!identity || !isAdmin(identity)) {
    res.status(403).json({ error: 'Administrator access is required.' });
    return;
  }
  next();
}

function validateId(id: string) {
  return z.string().uuid().safeParse(id).success;
}

function parseOrRespond<T>(schema: z.ZodType<T>, value: unknown, res: Response): T | null {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request data.', details: parsed.error.issues.map(({ path: issuePath, message }) => ({ path: issuePath.join('.'), message })) });
    return null;
  }
  return parsed.data;
}

async function enforceRateLimit(req: Request, res: Response, scope: string, maximum: number) {
  const ipHash = createHash('sha256').update(`${scope}:${req.ip || 'unknown'}`).digest('hex');
  const result = await db.query<{ request_count: number }>(
    `INSERT INTO api_rate_limits (ip_hash, window_start, request_count)
     VALUES ($1, date_trunc('hour', NOW()), 1)
     ON CONFLICT (ip_hash, window_start)
     DO UPDATE SET request_count = api_rate_limits.request_count + 1
     RETURNING request_count`,
    [ipHash]
  );
  if (result.rows[0].request_count > maximum) {
    res.status(429).json({ error: 'Too many requests. Please try again later.' });
    return false;
  }
  if (Date.now() - lastRateLimitCleanup > 60 * 60 * 1000) {
    lastRateLimitCleanup = Date.now();
    void db.query("DELETE FROM api_rate_limits WHERE window_start < NOW() - INTERVAL '2 hours'").catch(() => {});
  }
  return true;
}

async function getInquiryForIdentity(inquiryId: string, identity: ApiIdentity, res: Response) {
  if (!validateId(inquiryId)) {
    res.status(400).json({ error: 'Invalid inquiry ID.' });
    return null;
  }
  const result = await db.query<{ uid: string | null }>('SELECT uid FROM inquiries WHERE id = $1', [inquiryId]);
  const inquiry = result.rows[0];
  if (!inquiry) {
    res.status(404).json({ error: 'Inquiry not found.' });
    return null;
  }
  if (!isAdmin(identity) && inquiry.uid !== identity.uid) {
    res.status(403).json({ error: 'You do not have access to this inquiry.' });
    return null;
  }
  return inquiry;
}

async function startServer() {
  await db.query('SELECT 1');
  const app = express();
  app.set('trust proxy', process.env.NODE_ENV === 'production' && process.env.TRUST_PROXY === 'true' ? 1 : false);
  const contentSecurityPolicy = process.env.NODE_ENV === 'production' ? {
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'"],
      baseUri: ["'self'"],
      connectSrc: [
        "'self'",
        'https://identitytoolkit.googleapis.com',
        'https://securetoken.googleapis.com',
        'https://www.googleapis.com',
        'https://*.googleapis.com',
        'https://*.firebaseapp.com',
        'https://firebaseinstallations.googleapis.com',
        'https://fonts.googleapis.com',
        'https://fonts.gstatic.com',
      ],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      frameAncestors: ["'none'"],
      frameSrc: ["'self'", 'https://*.firebaseapp.com', 'https://accounts.google.com', 'https://www.google.com', 'https://www.recaptcha.net'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https:'],
      objectSrc: ["'none'"],
      scriptSrc: ["'self'", 'https://www.gstatic.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    },
  } : false;
  app.use(helmet({ contentSecurityPolicy }));
  app.use(express.json({ limit: '16kb' }));

  app.get('/api/healthz', (_req, res) => res.json({ ok: true }));

  app.post('/api/admin/login', asyncRoute(async (req, res) => {
    const origin = req.get('origin');
    if (origin && new URL(origin).host !== req.get('host')) {
      res.status(403).json({ error: 'Cross-origin sign-in is not allowed.' });
      return;
    }
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_SESSION_SECRET.length < 32) {
      res.status(503).json({ error: 'Admin login is not configured on this server.' });
      return;
    }
    if (!await enforceRateLimit(req, res, 'admin-login', 10)) return;
    const credentials = parseOrRespond(adminLoginSchema, req.body, res);
    if (!credentials) return;
    const suppliedEmail = credentials.email.trim().toLowerCase();
    const suppliedPasswordHash = createHash('sha256').update(credentials.password).digest();
    const configuredPasswordHash = createHash('sha256').update(ADMIN_PASSWORD).digest();
    const validPassword = timingSafeEqual(suppliedPasswordHash, configuredPasswordHash);
    if (suppliedEmail !== ADMIN_EMAIL || !validPassword) {
      res.status(401).json({ error: 'Invalid admin email or password.' });
      return;
    }
    setAdminSessionCookie(res, signAdminSession());
    res.json({ email: ADMIN_EMAIL, isAdmin: true });
  }));

  app.post('/api/admin/logout', (req, res) => {
    const origin = req.get('origin');
    if (origin && new URL(origin).host !== req.get('host')) {
      res.status(403).json({ error: 'Cross-origin sign-out is not allowed.' });
      return;
    }
    clearAdminSessionCookie(res);
    res.status(204).end();
  });

  app.get('/api/session', requireUser, (req, res) => {
    const identity = res.locals.identity as ApiIdentity;
    res.json(identity);
  });

  app.post('/api/inquiries', requireOptionalUser, asyncRoute(async (req, res) => {
    if (!await enforceRateLimit(req, res, 'inquiry', 5)) return;
    const inquiry = parseOrRespond(inquiryCreateSchema, req.body, res);
    if (!inquiry) return;
    const identity = res.locals.identity as ApiIdentity | undefined;
    const result = await db.query(
      `INSERT INTO inquiries (id, uid, name, email, phone, website, project_type, budget, idea)
       VALUES ($1, $2, $3, $4, NULLIF($5, ''), NULLIF($6, ''), $7, NULLIF($8, ''), $9)
       RETURNING ${inquiryColumns}`,
      [randomUUID(), identity?.uid || null, inquiry.name, inquiry.email, inquiry.phone || '', inquiry.website || '', inquiry.projectType, inquiry.budget || '', inquiry.idea]
    );
    res.status(201).json(result.rows[0]);
  }));

  app.get('/api/inquiries', requireUser, asyncRoute(async (_req, res) => {
    const identity = res.locals.identity as ApiIdentity;
    const result = isAdmin(identity)
      ? await db.query(`SELECT ${inquiryColumns} FROM inquiries ORDER BY created_at DESC LIMIT 500`)
      : await db.query(`SELECT ${inquiryColumns} FROM inquiries WHERE uid = $1 ORDER BY created_at DESC LIMIT 100`, [identity.uid]);
    res.json(result.rows);
  }));

  app.patch('/api/inquiries/:id', requireUser, requireAdmin, asyncRoute(async (req, res) => {
    if (!validateId(req.params.id)) {
      res.status(400).json({ error: 'Invalid inquiry ID.' });
      return;
    }
    const changes = parseOrRespond(inquiryUpdateSchema, req.body, res);
    if (!changes) return;
    const result = await db.query(
      `UPDATE inquiries
       SET status = COALESCE($2, status),
           deployed_url = CASE WHEN $3 THEN $4 ELSE deployed_url END,
           updated_at = NOW()
       WHERE id = $1
       RETURNING ${inquiryColumns}`,
      [req.params.id, changes.status || null, changes.deployedUrl !== undefined, changes.deployedUrl ?? null]
    );
    if (!result.rowCount) {
      res.status(404).json({ error: 'Inquiry not found.' });
      return;
    }
    res.json(result.rows[0]);
  }));

  app.get('/api/inquiries/:id/messages', requireUser, asyncRoute(async (req, res) => {
    const identity = res.locals.identity as ApiIdentity;
    if (!await getInquiryForIdentity(req.params.id, identity, res)) return;
    const result = await db.query(
      `SELECT id, inquiry_id AS "inquiryId", sender_id AS "senderId", sender_type AS "senderType",
              sender_name AS "senderName", message, created_at AS "createdAt", read
       FROM messages WHERE inquiry_id = $1 ORDER BY created_at ASC LIMIT 500`,
      [req.params.id]
    );
    res.json(result.rows);
  }));

  app.post('/api/inquiries/:id/messages', requireUser, asyncRoute(async (req, res) => {
    const identity = res.locals.identity as ApiIdentity;
    if (!await getInquiryForIdentity(req.params.id, identity, res)) return;
    const data = parseOrRespond(messageSchema, req.body, res);
    if (!data) return;
    const admin = isAdmin(identity);
    const result = await db.query(
      `INSERT INTO messages (id, inquiry_id, sender_id, sender_type, sender_name, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, inquiry_id AS "inquiryId", sender_id AS "senderId", sender_type AS "senderType",
                 sender_name AS "senderName", message, created_at AS "createdAt", read`,
      [randomUUID(), req.params.id, identity.uid, admin ? 'admin' : 'client', admin ? 'runfourcode Admin' : 'Client', data.message]
    );
    if (admin) {
      await db.query("UPDATE inquiries SET status = 'REPLIED', updated_at = NOW() WHERE id = $1 AND status = 'NEW'", [req.params.id]);
    }
    res.status(201).json(result.rows[0]);
  }));

  app.get('/api/site-content', asyncRoute(async (_req, res) => {
    const result = await db.query(
      `SELECT hero_title AS "heroTitle", hero_subtitle AS "heroSubtitle",
              positioning_headline AS "positioningHeadline", positioning_body AS "positioningBody", services
       FROM site_content WHERE id = 'main'`
    );
    res.json(result.rows[0] || contentDefaults);
  }));

  app.put('/api/site-content', requireUser, requireAdmin, asyncRoute(async (req, res) => {
    const content = parseOrRespond(siteContentSchema, req.body, res);
    if (!content) return;
    await db.query(
      `INSERT INTO site_content (id, hero_title, hero_subtitle, positioning_headline, positioning_body, services)
       VALUES ('main', $1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET hero_title = EXCLUDED.hero_title,
         hero_subtitle = EXCLUDED.hero_subtitle, positioning_headline = EXCLUDED.positioning_headline,
         positioning_body = EXCLUDED.positioning_body, services = EXCLUDED.services, updated_at = NOW()`,
      [content.heroTitle, content.heroSubtitle, content.positioningHeadline, content.positioningBody, JSON.stringify(content.services)]
    );
    res.json(content);
  }));

  app.post('/api/ai-debugger', requireUser, requireAdmin, asyncRoute(async (req, res) => {
    const data = parseOrRespond(aiRequestSchema, req.body, res);
    if (!data) return;
    if (!process.env.GEMINI_API_KEY) {
      res.status(503).json({ error: 'AI debugger is not configured on this server.' });
      return;
    }
    const serializedLogs = JSON.stringify(data.logs || {}).slice(0, 12000);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are the lead AI code debugger for runfourcode. Analyze the supplied logs and prompt. Be concise, technical, and actionable.\n\nApp logs/context: ${serializedLogs}\n\nAdmin prompt: ${data.prompt}`,
      });
      res.json({ success: true, analysis: response.text || 'AI analysis completed.' });
    } catch (error) {
      console.error('AI debugger request failed:', error instanceof Error ? error.message : 'Unknown error');
      res.status(502).json({ error: 'The AI debugger is temporarily unavailable.' });
    }
  }));

  app.use('/api', (_req, res) => res.status(404).json({ error: 'API route not found.' }));

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve('dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
  } else {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  }

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Invalid request data.' });
      return;
    }
    console.error('API request failed:', error instanceof Error ? error.message : 'Unknown error');
    res.status(500).json({ error: 'An internal server error occurred.' });
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`runfourcode server listening on port ${PORT}`);
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_SESSION_SECRET.length < 32) {
      console.warn('Admin login is not configured; set ADMIN_EMAIL, ADMIN_PASSWORD, and a 32+ character ADMIN_SESSION_SECRET.');
    }
  });
  const shutdown = () => server.close(() => void db.end());
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

startServer().catch((error) => {
  console.error('Could not start runfourcode server:', error instanceof Error ? error.message : error);
  process.exit(1);
});