import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db'; // Assuming db client is set up here
import { users } from '@/db/schema'; // Assuming schema is in '@/db/schema'
import { eq } from 'drizzle-orm';

// Zod schema for request body validation
const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

    // Create new user in the database
    await db.insert(users).values({
      id: crypto.randomUUID(), // Generate a new UUID for the user ID
      email,
      hashedPassword,
    });

    return NextResponse.json({ message: 'User registered successfully' }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle specific errors or return a generic error message
    if (error.message === 'User already exists') {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Failed to register user' }, { status: 500 });
  }
}