import { NextResponse } from 'next/server';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { verifyAdminFromRequest } from '../../../lib/server/firebaseAdmin';

// Firestore path: global_local_mixes/{mixId}

// Helpers
async function fetchAllGlobalLocalMixes() {
  const mixesCol = collection(db, 'global_local_mixes');
  const snap = await getDocs(mixesCol);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

function validateLocalMixPayload(body) {
  // Minimal validation to match existing Local Mix form shape:
  // { name, protein, ingredients: [{ name, percentage, pricePerKg }], instructions: [string] }
  const payload = {
    name: String(body.name || ''),
    protein: Number(body.protein ?? 0),
    ingredients: Array.isArray(body.ingredients)
      ? body.ingredients.map((ing) => ({
          name: String(ing?.name || ''),
          percentage: Number(ing?.percentage ?? 0),
          pricePerKg: Number(ing?.pricePerKg ?? 0),
        }))
      : [],
    instructions: Array.isArray(body.instructions)
      ? body.instructions.map((s) => String(s))
      : [],
  };
  return payload;
}

// GET /api/global-local-mixes
// Public: returns all global local mixes
export async function GET() {
  try {
    const data = await fetchAllGlobalLocalMixes();
    return NextResponse.json({ mixes: data });
  } catch (error) {
    console.error('[global-local-mixes] GET error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/global-local-mixes
// Admin-only: create or upsert a local mix
// Body: { mixId? (optional for upsert), mix: LocalMixPayload }
export async function POST(request) {
  try {
    const adminCheck = await verifyAdminFromRequest(request);
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const mixId = body.mixId ? String(body.mixId) : undefined;
    const payload = validateLocalMixPayload(body.mix || {});

    const id = mixId || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const ref = doc(db, 'global_local_mixes', id);
    await setDoc(ref, payload, { merge: true });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('[global-local-mixes] POST error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/global-local-mixes
// Admin-only: update an existing local mix
// Body: { mixId, mix: LocalMixPayload }
export async function PUT(request) {
  try {
    const adminCheck = await verifyAdminFromRequest(request);
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const mixId = String(body.mixId || '').trim();
    if (!mixId) {
      return NextResponse.json({ error: 'mixId is required' }, { status: 400 });
    }
    const payload = validateLocalMixPayload(body.mix || {});
    const ref = doc(db, 'global_local_mixes', mixId);
    await setDoc(ref, payload, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[global-local-mixes] PUT error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/global-local-mixes
// Admin-only: delete an existing local mix
// Body: { mixId }
export async function DELETE(request) {
  try {
    const adminCheck = await verifyAdminFromRequest(request);
    if (!adminCheck.ok) {
      return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
    }

    const body = await request.json();
    const mixId = String(body.mixId || '').trim();
    if (!mixId) {
      return NextResponse.json({ error: 'mixId is required' }, { status: 400 });
    }

    const ref = doc(db, 'global_local_mixes', mixId);
    await deleteDoc(ref);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[global-local-mixes] DELETE error:', error?.message || error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}