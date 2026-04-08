import { BookCallSection } from "@/components/sections/book-call";
import { bookCallSection } from "@/data/book-call";

export default function BookPage() {
  return (
    <div className="flex flex-1">
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-32 pt-16 md:px-10 md:pb-40 md:pt-24">
        <BookCallSection content={bookCallSection} />
      </main>
    </div>
  );
}
