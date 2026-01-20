import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    console.log('Signup attempt:', { name, email });

    const token = jwt.sign(
      { email, name },
      'fallback-secret',
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({ 
      success: true, 
      user: { name, email }
    });
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}