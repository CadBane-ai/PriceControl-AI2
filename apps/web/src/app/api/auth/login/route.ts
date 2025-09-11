import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db'; // Assuming db client is set up here
import { users } from '@/db/schema'; // Assuming schema is in '@/db/schema'
import { eq } from 'drizzle-orm';
import { signIn } from 'next-auth'; // Correct import for server-side

// Zod schema for request body validation
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Sign in the user using NextAuth.js
    // NOTE: This assumes NextAuth.js is configured in the project.
    // The signIn function from 'next-auth/react' is for client-side.
    // For server-side, we typically use 'next-auth' and its signIn function.
    // Let's assume we need to import from 'next-auth' for server actions/routes.
    // If not, this part might need adjustment based on NextAuth.js setup.

    // For server-side sign-in, we might need to use the signIn function from 'next-auth'
    // and handle the response appropriately.
    // Example using 'next-auth' (requires setup):
    // import { signIn as signInServer } from 'next-auth/server';
    // const result = await signInServer('credentials', {
    //   email: user.email,
    //   password: password, // Pass original password for credentials provider
    //   redirect: false, // Prevent redirect on server-side
    // });
    //
    // if (result?.error) {
    //   return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    // }

    // Sign in the user using NextAuth.js credentials provider
    const result = await signIn('credentials', {
      email: user.email,
      password: password, // Pass original password for credentials provider
      redirect: false, // Prevent redirect on server-side
    });

    if (result?.error) {
      // This error could be from NextAuth.js itself if credentials provider fails
      console.error('NextAuth.js sign-in error:', result.error);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // If signIn is successful, NextAuth.js handles session creation and cookie setting.
    // We just need to return a success response.
    return NextResponse.json({ message: 'Login successful' }, { status: 200 });

  } catch (error: any) {
    console.error('Login API error:', error);
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 });
  }
}