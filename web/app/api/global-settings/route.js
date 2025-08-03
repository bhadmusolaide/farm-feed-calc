import { NextResponse } from 'next/server';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { verifyAdminFromRequest } from '../../../lib/server/firebaseAdmin';

// Firestore path for global settings
const GLOBAL_SETTINGS_COLLECTION = 'global_settings';
const GLOBAL_SETTINGS_DOC_ID = 'site';

// Shape alignment note:
// We store exactly the shape used by SettingsPage:
// {
//   siteTitle, siteDescription, logoUrl,
//   footer: { logoUrl, description, features[], support[], copyright },
//   recommendedFeeds: { title, description },
//   heroVideo: { enabled, url, title }
// }

// GET /api/global-settings
// Public read: return the global settings doc (or sensible defaults if missing)
export async function GET() {
  try {
    const ref = doc(db, GLOBAL_SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC_ID);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      // Provide empty defaults so the UI has a consistent object
      return NextResponse.json({
        siteTitle: '',
        siteDescription: '',
        logoUrl: '',
        footer: {
          logoUrl: '',
          description: '',
          features: [],
          support: [],
          copyright: ''
        },
        recommendedFeeds: {
          title: '',
          description: ''
        },
        heroVideo: {
          enabled: false,
          url: '',
          title: ''
        }
      });
    }

    const data = snap.data() || {};
    // Defensive normalization: ensure object fields exist for client merging
    return NextResponse.json({
      siteTitle: data.siteTitle || '',
      siteDescription: data.siteDescription || '',
      logoUrl: data.logoUrl || '',
      footer: {
        logoUrl: data.footer?.logoUrl || '',
        description: data.footer?.description || '',
        features: Array.isArray(data.footer?.features) ? data.footer.features : [],
        support: Array.isArray(data.footer?.support) ? data.footer.support : [],
        copyright: data.footer?.copyright || ''
      },
      recommendedFeeds: {
        title: data.recommendedFeeds?.title || '',
        description: data.recommendedFeeds?.description || ''
      },
      heroVideo: {
        enabled: !!data.heroVideo?.enabled,
        url: data.heroVideo?.url || '',
        title: data.heroVideo?.title || ''
      }
    });
  } catch (error) {
    console.error('[global-settings] GET error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/global-settings
// Admin-only: update the global settings doc with provided payload
export async function PUT(request) {
  try {
    // Verify admin via Firebase Admin SDK (Authorization: Bearer <idToken>)
    const adminCheck = await verifyAdminFromRequest(request);
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();

    // Validate minimal structure to prevent accidental schema drift
    const payload = {
      siteTitle: typeof body.siteTitle === 'string' ? body.siteTitle : '',
      siteDescription: typeof body.siteDescription === 'string' ? body.siteDescription : '',
      logoUrl: typeof body.logoUrl === 'string' ? body.logoUrl : '',
      footer: {
        logoUrl: body.footer?.logoUrl || '',
        description: body.footer?.description || '',
        features: Array.isArray(body.footer?.features) ? body.footer.features : [],
        support: Array.isArray(body.footer?.support) ? body.footer.support : [],
        copyright: body.footer?.copyright || ''
      },
      recommendedFeeds: {
        title: body.recommendedFeeds?.title || '',
        description: body.recommendedFeeds?.description || ''
      },
      heroVideo: {
        enabled: !!body.heroVideo?.enabled,
        url: body.heroVideo?.url || '',
        title: body.heroVideo?.title || ''
      }
    };

    const ref = doc(db, GLOBAL_SETTINGS_COLLECTION, GLOBAL_SETTINGS_DOC_ID);
    await setDoc(ref, payload, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[global-settings] PUT error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}