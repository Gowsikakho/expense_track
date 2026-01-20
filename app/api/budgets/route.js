import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/utils/dbConfig';
import { Budgets } from '@/utils/schema';

export async function POST(request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, amount, icon } = await request.json();

    const result = await db.insert(Budgets)
      .values({
        name,
        amount,
        createdBy: session.user.email,
        icon
      })
      .returning({ insertedId: Budgets.id });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}