// Server-only Firebase Admin initialization and helpers
// Env vars required (server-side only):
//   WEB_FIREBASE_ADMIN_PROJECT_ID
//   WEB_FIREBASE_ADMIN_CLIENT_EMAIL
//   WEB_FIREBASE_ADMIN_PRIVATE_KEY  (with \n newlines escaped as \\n in .env)
//
// Usage in API routes:
//   import { getAdminAuth, verifyAdminFromRequest } from '../../../lib/server/firebaseAdmin';

let _admin = null;
let _initialized = false;

// Dynamically import firebase-admin to avoid bundling in client
async function importAdmin() {
  if (_admin) return _admin;
  const admin = await import('firebase-admin');
  _admin = admin;
  return _admin;
}

// Initialize Admin SDK once per runtime
export async function getAdminAuth() {
  const admin = await importAdmin();

  if (!_initialized) {
    const hasApp = admin.apps && admin.apps.length > 0;
    if (!hasApp) {
      const projectId = process.env.WEB_FIREBASE_ADMIN_PROJECT_ID;
      const clientEmail = process.env.WEB_FIREBASE_ADMIN_CLIENT_EMAIL;
      let privateKey = process.env.WEB_FIREBASE_ADMIN_PRIVATE_KEY;

      if (!projectId || !clientEmail || !privateKey) {
        console.error('[firebaseAdmin] Missing admin env vars. Provide WEB_FIREBASE_ADMIN_* for server verification.');
        throw new Error('Admin credentials not configured');
      }

      // Convert escaped newlines
      privateKey = privateKey.replace(/\\n/g, '\n');

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
    }
    _initialized = true;
  }

  return _admin.auth();
}

// Verify ID token from Authorization: Bearer <token>
// and ensure custom claim admin === true
export async function verifyAdminFromRequest(request) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { ok: false, status: 401, error: 'Unauthorized: missing ID token' };
  }

  const idToken = authHeader.substring('Bearer '.length).trim();
  try {
    const auth = await getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);

    // Accept either custom claim admin === true or allowlisted email
    const claimAdmin = decoded?.admin === true || decoded?.claims?.admin === true;
    const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
    const email = (decoded?.email || '').toLowerCase();
    const emailAdmin = !!email && ADMIN_EMAILS.includes(email);

    if (!(claimAdmin || emailAdmin)) {
      return { ok: false, status: 403, error: 'Forbidden: admin rights required' };
    }

    return { ok: true, decoded };
  } catch (e) {
    console.error('[firebaseAdmin] ID token verification failed:', e?.message);
    return { ok: false, status: 401, error: 'Unauthorized: invalid ID token' };
  }
}