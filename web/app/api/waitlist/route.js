import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// Firestore collection name
const WAITLIST_COLLECTION = 'waitlist';

// Helper to validate Firebase client config presence (diagnostics)
function assertFirebaseConfig() {
  const missing = [];
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) missing.push('NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) missing.push('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) missing.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) missing.push('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET');
  if (!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID) missing.push('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID');
  if (!process.env.NEXT_PUBLIC_FIREBASE_APP_ID) missing.push('NEXT_PUBLIC_FIREBASE_APP_ID');
  if (missing.length > 0) {
    console.error('[Waitlist API] Missing Firebase env vars:', missing.join(', '));
  }
}

// Firebase Admin initialization (env-based)
// Required server-only envs:
//   WEB_FIREBASE_ADMIN_PROJECT_ID
//   WEB_FIREBASE_ADMIN_CLIENT_EMAIL
//   WEB_FIREBASE_ADMIN_PRIVATE_KEY (escaped with \n or quoted properly)
let adminApp = null;
async function getAdminAuth() {
  if (adminApp) return (await import('firebase-admin')).auth();

  const admin = await import('firebase-admin');
  const hasApps = admin.apps && admin.apps.length > 0;

  if (!hasApps) {
    const projectId = process.env.WEB_FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.WEB_FIREBASE_ADMIN_CLIENT_EMAIL;
    let privateKey = process.env.WEB_FIREBASE_ADMIN_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      console.error('[Waitlist API] Missing admin env vars. Provide WEB_FIREBASE_ADMIN_* for server verification.');
      throw new Error('Admin credentials not configured');
    }

    // Handle escaped newlines in env
    privateKey = privateKey.replace(/\\n/g, '\n');

    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  return admin.auth();
}

// Verify Firebase ID token from Authorization: Bearer <token> and enforce admin claim
async function requireAdmin(request) {
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    console.warn('[Waitlist API] Missing Authorization Bearer token');
    return { ok: false, status: 401, error: 'Unauthorized: missing ID token' };
  }

  const idToken = authHeader.substring('Bearer '.length).trim();
  try {
    const auth = await getAdminAuth();
    const decoded = await auth.verifyIdToken(idToken);

    // Admin check via custom claim or email allowlist doc (optional)
    const isAdminClaim = decoded.admin === true;

    if (!isAdminClaim) {
      return { ok: false, status: 403, error: 'Forbidden: admin claim required' };
    }

    return { ok: true, decoded };
  } catch (e) {
    console.error('[Waitlist API] ID token verification failed:', e?.message);
    return { ok: false, status: 401, error: 'Unauthorized: invalid ID token' };
  }
}

export async function POST(request) {
  try {
    assertFirebaseConfig();

    const { email, name } = await request.json();

    // Basic validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingQuery = query(
      collection(db, WAITLIST_COLLECTION),
      where('email', '==', email)
    );
    const existingSnapshot = await getDocs(existingQuery);

    if (!existingSnapshot.empty) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Add to waitlist in Firestore
    const entry = {
      email,
      name: name || 'Anonymous',
      timestamp: serverTimestamp(),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      status: 'pending'
    };

    const docRef = await addDoc(collection(db, WAITLIST_COLLECTION), entry);

    // Get total count for position
    const allEntriesSnapshot = await getDocs(collection(db, WAITLIST_COLLECTION));
    const position = allEntriesSnapshot.size;

    return NextResponse.json(
      {
        message: 'Successfully joined the waitlist!',
        position,
        id: docRef.id
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Waitlist API POST error:', {
      message: error?.message,
      stack: error?.stack
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    assertFirebaseConfig();

    // Verify admin via Firebase Admin SDK
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find and delete the entry
    const waitlistQuery = query(
      collection(db, WAITLIST_COLLECTION),
      where('email', '==', email)
    );

    const snapshot = await getDocs(waitlistQuery);

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Delete the document
    const docToDelete = snapshot.docs[0];
    await deleteDoc(doc(db, WAITLIST_COLLECTION, docToDelete.id));

    return NextResponse.json({
      success: true,
      message: 'Entry deleted successfully'
    });
  } catch (error) {
    console.error('Waitlist DELETE error:', {
      message: error?.message,
      stack: error?.stack
    });
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve waitlist stats (for admin)
export async function GET(request) {
  try {
    assertFirebaseConfig();

    // Verify admin via Firebase Admin SDK
    const adminCheck = await requireAdmin(request);
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const waitlistCollection = collection(db, WAITLIST_COLLECTION);
    const snapshot = await getDocs(waitlistCollection);
    const total = snapshot.size;

    // Calculate time-based statistics
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let todayCount = 0;
    let thisWeekCount = 0;
    let thisMonthCount = 0;

    // Get entries for admin view (full data for admin)
    const entries = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      const ts = data.timestamp;
      // Normalize Firestore Timestamp or ISO/string
      const iso = ts?.toDate?.()?.toISOString?.() || (typeof ts === 'string' ? ts : null);
      // If serverTimestamp() not yet resolved, fall back to doc create time
      const entryDate = iso ? new Date(iso) : new Date();

      // Count entries by time period
      if (entryDate >= today) todayCount++;
      if (entryDate >= thisWeek) thisWeekCount++;
      if (entryDate >= thisMonth) thisMonthCount++;

      return {
        id: docSnap.id,
        email: data.email,
        name: data.name,
        timestamp: iso || new Date().toISOString(),
        status: data.status,
        userAgent: data.userAgent || 'Unknown'
      };
    });

    const stats = {
      total,
      today: todayCount,
      thisWeek: thisWeekCount,
      thisMonth: thisMonthCount
    };

    return NextResponse.json({
      stats,
      entries: entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    });
  } catch (error) {
    console.error('Waitlist GET error:', {
      message: error?.message,
      stack: error?.stack
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}