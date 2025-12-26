// app/api/contact/route.ts
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // ============================================================
    // OPTION 1: RESEND (Recommended - Best for production)
    // ============================================================
    // Install: npm install resend
    // Sign up at https://resend.com (free: 100 emails/day, 3,000/month)
    // Add to .env.local: RESEND_API_KEY=re_xxxxx
    /*
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>', // Change after domain verification
      to: 'justinklu@gmail.com',
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
    */

    // ============================================================
    // OPTION 2: FORMSUBMIT (Easiest - No API key needed)
    // ============================================================
    // No installation needed - just uncomment this
    /*
    const formSubmitResponse = await fetch('https://formsubmit.co/ajax/justinklu@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        email: email,
        message: message,
        _subject: `Portfolio Contact from ${name}`,
        _template: 'table', // Makes email look nicer
      }),
    });

    if (!formSubmitResponse.ok) {
      throw new Error('Failed to send via FormSubmit');
    }
    */

    // ============================================================
    // OPTION 3: NODEMAILER (Gmail/SMTP)
    // ============================================================
    // Install: npm install nodemailer
    // For Gmail: Enable 2FA, then create App Password at https://myaccount.google.com/apppasswords
    // Add to .env.local:
    //   EMAIL_USER=your.email@gmail.com
    //   EMAIL_PASSWORD=your_app_password
    /*
    const nodemailer = require('nodemailer');
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'justinklu@gmail.com',
      replyTo: email,
      subject: `Portfolio Contact from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });
    */

    // ============================================================
    // TEMPORARY: Console log (for testing)
    // ============================================================
    console.log("📧 Contact form submission:", { name, email, message });
    
    // Uncomment ONE of the options above before deploying!

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

// Optional: Handle CORS for development
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}