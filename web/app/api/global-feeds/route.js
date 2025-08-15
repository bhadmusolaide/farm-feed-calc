import { NextResponse } from 'next/server';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { verifyAdminFromRequest } from '../../../lib/server/firebaseAdmin';

// Firestore paths:
// global_feeds/categories/{categoryId}/items/{feedId}

// Helpers
async function fetchAllGlobalFeeds() {
  const result = {};
  const categoriesCol = collection(db, 'global_feeds', 'categories');
  // Firestore doesn't support listing subcollections without known path; iterate known categories:
  // We will read categories document list from a special collection: global_feeds/categories (documents are categories)
  const catsSnap = await getDocs(categoriesCol);
  for (const catDoc of catsSnap.docs) {
    const categoryId = catDoc.id;
    const itemsCol = collection(db, 'global_feeds', 'categories', categoryId, 'items');
    const itemsSnap = await getDocs(itemsCol);
    result[categoryId] = itemsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  return result;
}

function validateFeedPayload(body) {
  // Minimal validation to avoid schema drift; accept shape similar to existing FEED_BRANDS entries
  // { brand, name, protein, calcium?, description?, packaging[], availability?, estimatedPrice?{ '25kg': number }, ageRange?, tags?[] }
  const payload = {
    brand: String(body.brand || ''),
    name: String(body.name || ''),
    protein: Number(body.protein ?? 0),
    calcium: body.calcium != null ? Number(body.calcium) : undefined,
    description: body.description != null ? String(body.description) : undefined,
    packaging: Array.isArray(body.packaging) ? body.packaging.map(String) : [],
    availability: body.availability != null ? String(body.availability) : undefined,
    estimatedPrice: typeof body.estimatedPrice === 'object' && body.estimatedPrice !== null ? body.estimatedPrice : {},
    ageRange: body.ageRange != null ? String(body.ageRange) : undefined,
    tags: Array.isArray(body.tags) ? body.tags.map(String) : []
  };
  return payload;
}

// GET /api/global-feeds
// Public: returns { categories: { [categoryId]: FeedItem[] } }
export async function GET() {
  try {
    const data = await fetchAllGlobalFeeds();
    return NextResponse.json({ categories: data });
  } catch (error) {
    console.error('[global-feeds] GET error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/global-feeds
// Admin-only: create or upsert a feed item
// Body: { categoryId, feedId? (optional for upsert), feed: FeedPayload }
export async function POST(request) {
  try {
    const adminCheck = await verifyAdminFromRequest(request);
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const categoryId = String(body.categoryId || '').trim();
    if (!categoryId) {
      return NextResponse.json({ error: 'categoryId is required' }, { status: 400 });
    }
    const feedId = (body.feedId ? String(body.feedId) : undefined);
    const payload = validateFeedPayload(body.feed || {});

    // Generate ID if not supplied
    const id = feedId || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const ref = doc(db, 'global_feeds', 'categories', categoryId, 'items', id);
    await setDoc(ref, payload, { merge: true });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('[global-feeds] POST error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/global-feeds
// Admin-only: update existing feed item
// Body: { categoryId, feedId, feed: FeedPayload }
export async function PUT(request) {
  try {
    const adminCheck = await verifyAdminFromRequest(request);
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const categoryId = String(body.categoryId || '').trim();
    const feedId = String(body.feedId || '').trim();
    if (!categoryId || !feedId) {
      return NextResponse.json({ error: 'categoryId and feedId are required' }, { status: 400 });
    }
    const payload = validateFeedPayload(body.feed || {});
    const ref = doc(db, 'global_feeds', 'categories', categoryId, 'items', feedId);
    await setDoc(ref, payload, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[global-feeds] PUT error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/global-feeds
// Admin-only: delete feed item
// Body: { categoryId, feedId }
export async function DELETE(request) {
  try {
    const adminCheck = await verifyAdminFromRequest(request);
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const categoryId = String(body.categoryId || '').trim();
    const feedId = String(body.feedId || '').trim();
    if (!categoryId || !feedId) {
      return NextResponse.json({ error: 'categoryId and feedId are required' }, { status: 400 });
    }

    const ref = doc(db, 'global_feeds', 'categories', categoryId, 'items', feedId);
    await deleteDoc(ref);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[global-feeds] DELETE error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}