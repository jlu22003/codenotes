// app/api/contact/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Name is required", field: "firstName" },
        { status: 400 }
      );
    }
    if (!email) {
      return NextResponse.json(
        { error: "Email is required", field: "email" },
        { status: 400 }
      );
    }
    if (!message) {
      return NextResponse.json(
        { error: "Message is required", field: "message" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format", field: "email" },
        { status: 400 }
      );
    }

    // Validate message length
    const MESSAGE_MAX_LENGTH = 2000;
    if (message.length > MESSAGE_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Message must be ${MESSAGE_MAX_LENGTH} characters or fewer`, field: "message" },
        { status: 400 }
      );
    }

    // ============================================================
    // OPTION 1: RESEND (Recommended - Best for production)
    // ============================================================
    // Install: npm install resend
    // Sign up at https://resend.com (free: 100 emails/day, 3,000/month)
    // Add to .env.local: RESEND_API_KEY=re_xxxxx
    
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>', // Change after domain verification
      to: 'justinklu75@gmail.com',
      replyTo: email, // Allows you to reply directly to sender
      subject: `Portfolio Contact from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return NextResponse.json(
      { message: "Message sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to send message. Please try again." },
      { status: 500 }
    );
  }
}