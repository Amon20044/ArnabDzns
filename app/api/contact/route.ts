import { NextResponse } from "next/server";
import { getMailInbox, getMailTransporter } from "@/config/nodemailer";
import { buildWhatsAppUrl, siteConfig } from "@/data/site";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTHER_INQUIRY_VALUE = "Other";

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

function getFirstName(name: string) {
  return name.split(/\s+/).filter(Boolean)[0] ?? "there";
}

function getResolvedInquiryType(body: Record<string, unknown>) {
  const inquiryType = readString(body.inquiryType);
  const customInquiryType = readString(body.customInquiryType);

  if (inquiryType === OTHER_INQUIRY_VALUE) {
    return customInquiryType;
  }

  return inquiryType || customInquiryType || "General inquiry";
}

function buildOwnerEmailText(submission: {
  name: string;
  email: string;
  brand: string;
  inquiryType: string;
  message: string;
  source: string;
}) {
  return [
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    submission.brand ? `Brand / Project: ${submission.brand}` : "",
    `Inquiry Type: ${submission.inquiryType}`,
    `Source: ${submission.source}`,
    "",
    submission.message,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildOwnerEmailHtml(
  submission: {
    name: string;
    email: string;
    brand: string;
    inquiryType: string;
    message: string;
    source: string;
  },
  subject: string,
) {
  const replyHref = `mailto:${escapeHtml(submission.email)}`;

  return `
    <div style="margin:0;padding:32px 18px;background:#f5f3ff;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
      <div style="max-width:680px;margin:0 auto;">
        <div style="margin-bottom:14px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#6d28d9;">
          New Website Inquiry
        </div>
        <div style="border:1px solid #e9d5ff;border-radius:28px;overflow:hidden;background:linear-gradient(180deg,#ffffff 0%,#faf5ff 100%);box-shadow:0 22px 64px rgba(88,28,135,0.12);">
          <div style="padding:28px 28px 22px;background:radial-gradient(circle at top right,rgba(196,181,253,0.4),transparent 38%),linear-gradient(180deg,rgba(255,255,255,0.98) 0%,rgba(250,245,255,0.98) 100%);">
            <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#7e22ce;">
              Inbox Summary
            </p>
            <h1 style="margin:0;font-size:28px;line-height:1.15;">
              ${escapeHtml(subject)}
            </h1>
            <p style="margin:14px 0 0;font-size:15px;line-height:1.7;color:#4b5563;">
              A new inquiry just came in through the contact form. Everything important is below,
              with a direct reply path ready to go.
            </p>
            <div style="margin-top:22px;">
              <a
                href="${replyHref}"
                style="display:inline-block;border-radius:999px;background:#111827;padding:13px 20px;color:#ffffff;text-decoration:none;font-weight:700;"
              >
                Reply to ${escapeHtml(submission.name)}
              </a>
            </div>
          </div>

          <div style="padding:0 28px 28px;">
            <div style="margin-top:18px;border:1px solid #ede9fe;border-radius:22px;background:#ffffff;padding:18px 20px;">
              <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;">
                Quick Details
              </p>
              <p style="margin:0 0 8px;font-size:15px;line-height:1.7;"><strong>Name:</strong> ${escapeHtml(submission.name)}</p>
              <p style="margin:0 0 8px;font-size:15px;line-height:1.7;"><strong>Email:</strong> ${escapeHtml(submission.email)}</p>
              ${
                submission.brand
                  ? `<p style="margin:0 0 8px;font-size:15px;line-height:1.7;"><strong>Brand / Project:</strong> ${escapeHtml(submission.brand)}</p>`
                  : ""
              }
              <p style="margin:0 0 8px;font-size:15px;line-height:1.7;"><strong>Inquiry Type:</strong> ${escapeHtml(submission.inquiryType)}</p>
              <p style="margin:0;font-size:15px;line-height:1.7;"><strong>Source:</strong> ${escapeHtml(submission.source)}</p>
            </div>

            <div style="margin-top:18px;border:1px solid #ede9fe;border-radius:22px;background:#ffffff;padding:20px;">
              <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;">
                Project Brief
              </p>
              <p style="margin:0;font-size:15px;line-height:1.9;color:#111827;">
                ${formatMultiline(submission.message)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildCustomerEmailText(submission: {
  name: string;
  brand: string;
  inquiryType: string;
  message: string;
  source: string;
}) {
  const firstName = getFirstName(submission.name);
  const whatsappUrl = buildWhatsAppUrl(submission);

  return [
    `Hi ${firstName},`,
    "",
    "Your inquiry has been received.",
    "Thanks for sharing the brief. I will reach out soon with the clearest next step.",
    "",
    `Inquiry Type: ${submission.inquiryType}`,
    submission.brand ? `Brand / Project: ${submission.brand}` : "",
    "",
    "Your message:",
    submission.message,
    "",
    `WhatsApp: ${whatsappUrl}`,
    `Reply email: ${siteConfig.contact.emailAddress}`,
    `Website: ${siteConfig.url}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildCustomerEmailHtml(submission: {
  name: string;
  brand: string;
  inquiryType: string;
  message: string;
  source: string;
}) {
  const firstName = getFirstName(submission.name);
  const whatsappUrl = buildWhatsAppUrl(submission);

  return `
    <div style="margin:0;padding:32px 18px;background:#f8f7fc;font-family:Arial,Helvetica,sans-serif;color:#18181b;">
      <div style="max-width:680px;margin:0 auto;border:1px solid #e9d5ff;border-radius:30px;overflow:hidden;background:linear-gradient(180deg,#ffffff 0%,#faf5ff 100%);box-shadow:0 26px 80px rgba(88,28,135,0.12);">
        <div style="padding:30px 28px 24px;background:radial-gradient(circle at top right,rgba(196,181,253,0.38),transparent 38%),linear-gradient(180deg,rgba(255,255,255,0.98) 0%,rgba(250,245,255,0.98) 100%);">
          <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#6d28d9;">
            Inquiry Received
          </p>
          <h1 style="margin:0;font-size:30px;line-height:1.15;">
            Thanks ${escapeHtml(firstName)}, your brief is in.
          </h1>
          <p style="margin:16px 0 0;font-size:15px;line-height:1.8;color:#4b5563;">
            I have your message and I will reach out soon with the clearest next step. The goal is
            not a generic reply, but something useful and specific to what you are building.
          </p>
        </div>

        <div style="padding:0 28px 28px;">
          <div style="margin-top:18px;border:1px solid #ede9fe;border-radius:22px;background:#ffffff;padding:18px 20px;">
            <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;">
              Your Summary
            </p>
            <p style="margin:0 0 8px;font-size:15px;line-height:1.7;"><strong>Inquiry Type:</strong> ${escapeHtml(submission.inquiryType)}</p>
            ${
              submission.brand
                ? `<p style="margin:0 0 8px;font-size:15px;line-height:1.7;"><strong>Brand / Project:</strong> ${escapeHtml(submission.brand)}</p>`
                : ""
            }
            <p style="margin:0;font-size:15px;line-height:1.9;color:#374151;">
              ${formatMultiline(submission.message)}
            </p>
          </div>

          <div style="margin-top:18px;border:1px solid #ede9fe;border-radius:22px;background:linear-gradient(180deg,#ffffff 0%,#faf5ff 100%);padding:20px;">
            <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;">
              Need a faster route?
            </p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#4b5563;">
              If the project is time-sensitive, WhatsApp is ready with a prefilled message built
              from the brief you just sent. Otherwise, replying to this email works perfectly too.
            </p>
            <div>
              <a
                href="${escapeHtml(whatsappUrl)}"
                style="display:inline-block;border-radius:999px;background:#111827;padding:13px 20px;color:#ffffff;text-decoration:none;font-weight:700;margin-right:10px;margin-bottom:10px;"
              >
                WhatsApp ${escapeHtml(siteConfig.contact.whatsappDisplay)}
              </a>
              <a
                href="mailto:${escapeHtml(siteConfig.contact.emailAddress)}"
                style="display:inline-block;border-radius:999px;border:1px solid #d8b4fe;background:#ffffff;padding:13px 20px;color:#111827;text-decoration:none;font-weight:700;margin-bottom:10px;"
              >
                Email directly
              </a>
            </div>
          </div>

          <p style="margin:20px 0 0;font-size:13px;line-height:1.8;color:#6b7280;">
            Arnab<br />
            Designer & Developer<br />
            <a href="${escapeHtml(siteConfig.url)}" style="color:#6d28d9;text-decoration:none;">${escapeHtml(siteConfig.url)}</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const submission = {
      name: readString(body.name),
      email: readString(body.email),
      brand: readString(body.brand),
      inquiryType: getResolvedInquiryType(body),
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

    if (!submission.inquiryType) {
      return NextResponse.json(
        { message: "Pick an inquiry type, or choose Other and type it in." },
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
    const ownerSubject = `[Arnab] ${submission.inquiryType} inquiry from ${submission.name}`;
    const customerSubject = `Got your inquiry, ${getFirstName(submission.name)}`;

    const [ownerMailResult, customerMailResult] = await Promise.allSettled([
      transporter.sendMail({
        from: `"${siteConfig.name}" <${inbox}>`,
        to: inbox,
        replyTo: submission.email,
        subject: ownerSubject,
        text: buildOwnerEmailText(submission),
        html: buildOwnerEmailHtml(submission, ownerSubject),
      }),
      transporter.sendMail({
        from: `"${siteConfig.name}" <${inbox}>`,
        to: submission.email,
        replyTo: inbox,
        subject: customerSubject,
        text: buildCustomerEmailText(submission),
        html: buildCustomerEmailHtml(submission),
      }),
    ]);

    if (ownerMailResult.status === "rejected") {
      throw ownerMailResult.reason;
    }

    if (customerMailResult.status === "rejected") {
      console.error("Contact autoresponse failed", customerMailResult.reason);
    }

    return NextResponse.json({
      message: "Inquiry sent. I will reach out soon.",
      autoReplySent: customerMailResult.status === "fulfilled",
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
