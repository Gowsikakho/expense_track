import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    console.log('Signin attempt:', { email });

    const token = jwt.sign(
      { email },
      'fallback-secret',
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({ 
      success: true, 
      user: { email }
    });
    
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return response;
  } catch (error) {
    console.error('Signin error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}