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
  const brandSummary = submission.brand
    ? `
              <div style="margin:0 0 14px;">
                <p style="margin:0 0 5px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;">
                  Brand / Project
                </p>
                <p style="margin:0;font-size:16px;line-height:1.6;font-weight:600;color:#18181b;">
                  ${escapeHtml(submission.brand)}
                </p>
              </div>
            `
    : "";

  return `
    <div style="margin:0;padding:28px 14px;background-color:#f8f7fc;background-image:radial-gradient(circle at top left,rgba(255,255,255,0.96) 0%,rgba(255,255,255,0) 34%),radial-gradient(circle at top right,rgba(168,85,247,0.14) 0%,rgba(168,85,247,0) 38%),linear-gradient(180deg,#f8f7fc 0%,#f3e8ff 100%);font-family:'Aptos','Segoe UI','Helvetica Neue',Arial,sans-serif;color:#18181b;">
      <div style="max-width:680px;margin:0 auto;">
        <div style="margin:0 0 14px;text-align:center;">
          <span style="display:inline-block;border:1px solid rgba(168,85,247,0.18);border-radius:999px;background:#ffffff;padding:8px 14px;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#7e22ce;">
            ${escapeHtml(siteConfig.name)} / Contact
          </span>
        </div>

        <div style="overflow:hidden;border:1px solid #e9d5ff;border-radius:34px;background-color:#ffffff;background-image:linear-gradient(180deg,#ffffff 0%,#faf5ff 100%);box-shadow:0 28px 80px rgba(88,28,135,0.12);">
          <div style="padding:32px 30px 26px;border-bottom:1px solid rgba(233,213,255,0.76);background-color:#ffffff;background-image:radial-gradient(circle at 12% 0%,rgba(255,255,255,0.9) 0%,rgba(255,255,255,0) 34%),radial-gradient(circle at 92% 8%,rgba(168,85,247,0.24) 0%,rgba(168,85,247,0) 34%),linear-gradient(135deg,rgba(255,255,255,0.98) 0%,rgba(250,245,255,0.96) 64%,rgba(243,232,255,0.92) 100%);">
            <span style="display:inline-block;border-radius:999px;background:#18181b;padding:8px 14px;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;box-shadow:0 12px 30px rgba(9,9,11,0.18);">
              Inquiry Received
            </span>

            <h1 style="margin:18px 0 0;font-size:34px;line-height:1.02;letter-spacing:-0.04em;color:#09090b;">
              Thanks ${escapeHtml(firstName)}, your brief is in.
            </h1>

            <p style="margin:14px 0 0;max-width:540px;font-size:15px;line-height:1.8;color:#52525b;">
              Your message landed safely on my side. I will follow up with a clear, useful next
              step tailored to what you are building - not a generic autoresponse.
            </p>

            <div style="margin-top:22px;">
              <span style="display:inline-block;margin:0 8px 8px 0;border:1px solid #e9d5ff;border-radius:999px;background:rgba(255,255,255,0.9);padding:10px 14px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#581c87;">
                ${escapeHtml(submission.inquiryType)}
              </span>
              <span style="display:inline-block;margin:0 8px 8px 0;border:1px solid rgba(5,150,105,0.18);border-radius:999px;background:#f0fdf4;padding:10px 14px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#166534;">
                Replies within 1 business day
              </span>
            </div>
          </div>

          <div style="padding:26px 30px 30px;">
            <div style="overflow:hidden;border:1px solid #ede9fe;border-radius:26px;background:#ffffff;">
              <div style="padding:15px 20px;border-bottom:1px solid #f3e8ff;background:linear-gradient(180deg,rgba(250,245,255,0.9) 0%,rgba(255,255,255,0.98) 100%);">
                <p style="margin:0;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#71717a;">
                  Your Summary
                </p>
              </div>

              <div style="padding:18px 20px 20px;">
                <div style="margin:0 0 14px;">
                  <p style="margin:0 0 5px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;">
                    Inquiry Type
                  </p>
                  <p style="margin:0;font-size:16px;line-height:1.6;font-weight:600;color:#18181b;">
                    ${escapeHtml(submission.inquiryType)}
                  </p>
                </div>

                ${brandSummary}

                <div style="padding-top:18px;border-top:1px solid #f5f3ff;">
                  <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#71717a;">
                    Message
                  </p>
                  <div style="border-radius:20px;background:#faf5ff;padding:16px 16px;font-size:15px;line-height:1.9;color:#27272a;">
                    ${formatMultiline(submission.message)}
                  </div>
                </div>
              </div>
            </div>

            <div style="margin-top:18px;border:1px solid rgba(168,85,247,0.16);border-radius:26px;background-color:#ffffff;background-image:linear-gradient(135deg,rgba(255,255,255,0.98) 0%,rgba(243,232,255,0.94) 100%);padding:22px 20px;">
              <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;color:#71717a;">
                Need a faster route?
              </p>
              <h2 style="margin:0;font-size:22px;line-height:1.15;color:#09090b;">
                Reach me directly if timing is tight.
              </h2>
              <p style="margin:12px 0 18px;font-size:15px;line-height:1.8;color:#52525b;">
                WhatsApp is already prefilled from the brief you sent. If email is easier, just
                hit reply and keep everything in one thread.
              </p>
              <div>
                <a
                  href="${escapeHtml(whatsappUrl)}"
                  style="display:inline-block;margin:0 10px 10px 0;border-radius:999px;background:linear-gradient(135deg,#09090b 0%,#6b21a8 100%);padding:14px 20px;color:#ffffff;text-decoration:none;font-weight:700;box-shadow:0 16px 36px rgba(24,24,27,0.18);"
                >
                  WhatsApp ${escapeHtml(siteConfig.contact.whatsappDisplay)}
                </a>
                <a
                  href="mailto:${escapeHtml(siteConfig.contact.emailAddress)}"
                  style="display:inline-block;margin:0 0 10px;border-radius:999px;border:1px solid #d8b4fe;background:#ffffff;padding:14px 20px;color:#111827;text-decoration:none;font-weight:700;"
                >
                  Email directly
                </a>
              </div>
            </div>

            <p style="margin:22px 0 0;padding:0 4px;font-size:13px;line-height:1.8;color:#71717a;">
              <strong style="color:#18181b;">${escapeHtml(siteConfig.name)}</strong><br />
              ${escapeHtml(siteConfig.tagline)}<br />
              <a href="${escapeHtml(siteConfig.url)}" style="color:#7e22ce;text-decoration:none;font-weight:600;">${escapeHtml(siteConfig.url)}</a>
            </p>
          </div>
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
