import ProfileBioMarkdown from "@/content/profile-bio.md";

export const ProfileBioContent = () => {
  return (
    <article
      className="text-[15px] leading-7 text-text-secondary sm:text-base sm:leading-8
                 [&_a]:font-medium [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-4
                 [&_a:hover]:text-accent-dark
                 [&_blockquote]:my-6 [&_blockquote]:rounded-[1.25rem] [&_blockquote]:border
                 [&_blockquote]:border-black/8 [&_blockquote]:bg-white/70 [&_blockquote]:px-5
                 [&_blockquote]:py-4 [&_blockquote]:text-text-primary
                 [&_code]:rounded-[0.55rem] [&_code]:bg-black/5 [&_code]:px-2 [&_code]:py-1
                 [&_code]:text-[0.9em] [&_code]:text-text-primary
                 [&_em]:italic
                 [&_h1]:mb-5 [&_h1]:text-[clamp(1.8rem,4.4vw,2.6rem)] [&_h1]:font-semibold
                 [&_h1]:leading-[1.08] [&_h1]:tracking-[-0.04em] [&_h1]:text-text-primary
                 [&_h2]:mb-3 [&_h2]:mt-9 [&_h2]:text-[clamp(1.3rem,3vw,1.9rem)]
                 [&_h2]:font-semibold [&_h2]:leading-tight [&_h2]:tracking-[-0.04em]
                 [&_h2]:text-text-primary
                 [&_hr]:my-8 [&_hr]:border-black/8
                 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:space-y-3 [&_ol]:pl-6
                 [&_p]:mb-5 [&_p]:max-w-[65ch]
                 [&_strong]:font-semibold [&_strong]:text-text-primary
                 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:pl-6"
    >
      <ProfileBioMarkdown />
    </article>
  );
};
