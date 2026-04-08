import { NextResponse } from "next/server";
import { getMailInbox, getMailTransporter } from "@/config/nodemailer";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatMultiline(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const submission = {
      name: readString(body.name),
      email: readString(body.email),
      brand: readString(body.brand),
      inquiryType: readString(body.inquiryType) || "General inquiry",
      budget: readString(body.budget),
      timeline: readString(body.timeline),
      preferredContactMethod:
        readString(body.preferredContactMethod) || "No preference",
      message: readString(body.message),
      source: readString(body.source) || "site-form",
      website: readString(body.website),
    };

    if (submission.website) {
      return NextResponse.json({ message: "Thanks." });
    }

    if (!submission.name) {
      return NextResponse.json(
        { message: "Please add your name so I know who the message is from." },
        { status: 400 },
      );
    }

    if (!emailPattern.test(submission.email)) {
      return NextResponse.json(
        { message: "Please use a valid email address so I can reply." },
        { status: 400 },
      );
    }

    if (submission.message.length < 20) {
      return NextResponse.json(
        { message: "A little more context helps. Add at least 20 characters to the brief." },
        { status: 400 },
      );
    }

    const inbox = getMailInbox();
    const transporter = getMailTransporter();
    const subject = `[Arnab] ${submission.inquiryType} from ${submission.name}`;
    const lines = [
      `Name: ${submission.name}`,
      `Email: ${submission.email}`,
      submission.brand ? `Brand / Project: ${submission.brand}` : "",
      `Inquiry Type: ${submission.inquiryType}`,
      submission.budget ? `Budget: ${submission.budget}` : "",
      submission.timeline ? `Timeline: ${submission.timeline}` : "",
      submission.preferredContactMethod
        ? `Preferred Reply: ${submission.preferredContactMethod}`
        : "",
      `Source: ${submission.source}`,
      "",
      submission.message,
    ].filter(Boolean);

    await transporter.sendMail({
      from: `"${submission.name}" <${inbox}>`,
      to: inbox,
      replyTo: submission.email,
      subject,
      text: lines.join("\n"),
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.7;color:#18181b;background:#ffffff;padding:24px;">
          <div style="max-width:640px;margin:0 auto;border:1px solid #e9d5ff;border-radius:24px;padding:28px;background:linear-gradient(180deg,#ffffff 0%,#faf5ff 100%);">
            <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#7e22ce;">New Website Inquiry</p>
            <h1 style="margin:0 0 18px;font-size:28px;line-height:1.15;">${escapeHtml(subject)}</h1>
            <p style="margin:0 0 8px;"><strong>Name:</strong> ${escapeHtml(submission.name)}</p>
            <p style="margin:0 0 8px;"><strong>Email:</strong> ${escapeHtml(submission.email)}</p>
            ${
              submission.brand
                ? `<p style="margin:0 0 8px;"><strong>Brand / Project:</strong> ${escapeHtml(submission.brand)}</p>`
                : ""
            }
            <p style="margin:0 0 8px;"><strong>Inquiry Type:</strong> ${escapeHtml(submission.inquiryType)}</p>
            ${
              submission.budget
                ? `<p style="margin:0 0 8px;"><strong>Budget:</strong> ${escapeHtml(submission.budget)}</p>`
                : ""
            }
            ${
              submission.timeline
                ? `<p style="margin:0 0 8px;"><strong>Timeline:</strong> ${escapeHtml(submission.timeline)}</p>`
                : ""
            }
            ${
              submission.preferredContactMethod
                ? `<p style="margin:0 0 8px;"><strong>Preferred Reply:</strong> ${escapeHtml(submission.preferredContactMethod)}</p>`
                : ""
            }
            <p style="margin:0 0 18px;"><strong>Source:</strong> ${escapeHtml(submission.source)}</p>
            <div style="margin-top:20px;border-top:1px solid #e9d5ff;padding-top:20px;">
              <p style="margin:0 0 10px;font-weight:600;">Project notes</p>
              <p style="margin:0;">${formatMultiline(submission.message)}</p>
            </div>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      message: "Message sent. I will get back to you with the next step soon.",
    });
  } catch (error) {
    console.error("Contact form delivery failed", error);

    return NextResponse.json(
      {
        message: "The message could not be sent right now. Please try again in a few minutes.",
      },
      { status: 500 },
    );
  }
}
