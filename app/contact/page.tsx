import { Clock3, Mail, ShieldCheck } from "lucide-react";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { PageShell } from "@/components/site/page-shell";

const contactCards = [
  {
    title: "Response rhythm",
    description: "Most messages get a thoughtful reply within one business day.",
    Icon: Clock3,
  },
  {
    title: "Direct inbox",
    description: "The form sends straight through Nodemailer to the configured Gmail inbox.",
    Icon: Mail,
  },
  {
    title: "Useful first reply",
    description: "Expect next steps, rough direction, and whether a call is actually needed.",
    Icon: ShieldCheck,
  },
];

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Tell me what you are building and where it needs to go next."
      description="Share the idea, timeline, and the part that still feels unresolved. We can start from a rough note and shape it into a clear direction."
      cta={{
        href: "/book",
        label: "Prefer a call instead?",
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(280px,0.88fr)]">
        <InquiryForm
          source="contact-page"
          defaultInquiryType="Portfolio website"
          submitLabel="Send message"
        />

        <div className="page-stack">
          {contactCards.map(({ title, description, Icon }) => (
            <article key={title} className="page-surface page-reveal p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight text-text-primary">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-text-secondary md:text-base">
                    {description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
