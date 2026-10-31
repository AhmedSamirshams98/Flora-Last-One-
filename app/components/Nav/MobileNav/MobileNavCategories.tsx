import { ChevronLeft, ChevronRight } from "lucide-react";

const MobileNavCategories = ({ lang, onSelect }: any) => {
  const isAr = lang === "ar";
  const Chevron = isAr ? ChevronLeft : ChevronRight;
  return (
    <section className="grid grid-cols-2 gap-3 px-5 pt-6">
      {["SHOE", "BAG"].map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`flex min-h-16 items-center justify-between gap-2 rounded-2xl border border-gold/35 bg-primary-foreground/5 px-4 py-3 text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-[#fff7ee] ${
            isAr ? "font-gess" : ""
          }`}
        >
          <span className="text-lg">
            {isAr
              ? cat === "SHOE"
                ? "أحذية"
                : "شنط"
              : cat === "SHOE"
              ? "Shoes"
              : "Bags"}
          </span>
          <Chevron aria-hidden="true" className="h-5 w-5 text-gold" />
        </button>
      ))}
    </section>
  );
};

export default MobileNavCategories;
