import { NextResponse } from 'next/server';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

// Firestore collection name
const WAITLIST_COLLECTION = 'waitlist';

export async function POST(request) {
  try {
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

    // In production, you can add:
    // 1. Send confirmation email to user
    // 2. Send notification email to admin
    // 3. Integrate with email service (SendGrid, Mailgun, etc.)
    
    console.log('New waitlist entry added with ID:', docRef.id);
    console.log('Total waitlist entries:', position);

    return NextResponse.json(
      { 
        message: 'Successfully joined the waitlist!',
        position: position,
        id: docRef.id
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
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
    
    console.log(`Waitlist entry deleted: ${email}`);
    
    return NextResponse.json({ 
      success: true,
      message: 'Entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve waitlist stats (for admin)
export async function GET() {
  try {
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
    const entries = snapshot.docs.map(doc => {
      const data = doc.data();
      const entryDate = new Date(data.timestamp?.toDate?.() || data.timestamp);
      
      // Count entries by time period
      if (entryDate >= today) todayCount++;
      if (entryDate >= thisWeek) thisWeekCount++;
      if (entryDate >= thisMonth) thisMonthCount++;
      
      return {
        id: doc.id,
        email: data.email, // Full email for admin
        name: data.name,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp,
        status: data.status,
        userAgent: data.userAgent
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
      entries: entries.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Sort by join date
    });
  } catch (error) {
    console.error('Waitlist GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}