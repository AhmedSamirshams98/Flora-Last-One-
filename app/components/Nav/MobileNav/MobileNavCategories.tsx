import { ChevronLeft, ChevronRight } from "lucide-react";

const MobileNavCategories = ({ lang, onSelect }: any) => (
  <section className="mt-8 pt-6 border-t border-white/20 p-2 space-y-4">
    {["SHOE", "BAG"].map((cat) => (
      <button
        key={cat}
        onClick={() => onSelect(cat)}
        className="w-full px-4 py-4 flex justify-between text-white hover:bg-white/10 rounded-xl border border-white/10"
      >
        {lang === "ar"
          ? cat === "SHOE"
            ? "أحذية"
            : "شنط"
          : cat === "SHOE"
          ? "Shoes"
          : "Bags"}
        {lang === "ar" ? <ChevronLeft /> : <ChevronRight />}
      </button>
    ))}
  </section>
);

export default MobileNavCategories;
