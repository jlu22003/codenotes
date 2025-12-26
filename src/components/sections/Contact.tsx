// components/sections/Contact.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle, Send } from "lucide-react";
import Link from "next/link";

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setStatus("success");
      setFormData({ firstName: "", lastName: "", email: "", message: "" });

      // Reset success message after 5 seconds
      setTimeout(() => setStatus("idle"), 5000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error 
          ? error.message 
          : "Failed to send message. Please try emailing me directly."
      );
      console.error("Contact form error:", error);
    }
  };

  return (
    <section id="contact-me" className="py-24">
      <div className="container mx-auto max-w-7xl px-8">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-muted-foreground">
            Interested in working together or have a question?
            I'm always open to new opportunities and conversations.
          </p>
        </div>

        {/* Content */}
        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-medium text-foreground mb-2">
                Contact Details
              </h3>
              <p className="text-muted-foreground">
                Feel free to reach out directly or use the form.
              </p>
            </div>

            <ul className="space-y-2 text-muted-foreground">
              <li>
                <span className="font-medium text-foreground">Email:</span>{" "}
                <Link href="mailto:justinklu@gmail.com" className="underline hover:text-primary transition-colors">
                  justinklu@gmail.com
                </Link>
              </li>
              <li>
                <span className="font-medium text-foreground">Location:</span>{" "}
                Alpharetta, GA / U.S.
              </li>
            </ul>
          </div>

          {/* Form */}
          <Card className="p-8 bg-card border border-border/60 shadow-sm">
            {/* Success Message */}
            {status === "success" && (
              <div className="mb-6 flex items-start gap-3 rounded-md bg-primary/10 border border-primary/20 px-4 py-3 text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-primary">Message sent successfully!</p>
                  <p className="text-muted-foreground mt-1">
                    Thanks for reaching out. I'll get back to you soon.
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {status === "error" && (
              <div className="mb-6 flex items-start gap-3 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Failed to send message</p>
                  <p className="text-muted-foreground mt-1">{errorMessage}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={status === "loading"}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={status === "loading"}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={status === "loading"}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Tell me a bit about what you're working on…"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  disabled={status === "loading"}
                  required
                />
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full gap-2"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
}
