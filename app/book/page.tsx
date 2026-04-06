import { CalendarClock, NotebookPen, PhoneCall } from "lucide-react";
import { InquiryForm } from "@/components/forms/inquiry-form";
import { PageShell } from "@/components/site/page-shell";

const callNotes = [
  {
    title: "Focused intro call",
    description: "Best for projects that need alignment, scoping, or a clear first sprint.",
    Icon: PhoneCall,
  },
  {
    title: "Bring the rough version",
    description: "A loose brief, moodboard, or a few bullet points are more than enough.",
    Icon: NotebookPen,
  },
  {
    title: "Agenda-first follow-up",
    description: "If a call makes sense, the follow-up will turn into action items quickly.",
    Icon: CalendarClock,
  },
];

export default function BookPage() {
  return (
    <PageShell
      eyebrow="Book a Call"
      title="Use this page when the project is easier to talk through than type out."
      description="If you would rather start with a short call, send the basics here and I will reply with the right next step and availability."
      cta={{
        href: "/contact",
        label: "Need a written brief instead?",
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)]">
        <InquiryForm
          source="book-page"
          defaultInquiryType="Discovery call"
          submitLabel="Request a call"
        />

        <div className="page-stack">
          {callNotes.map(({ title, description, Icon }) => (
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
