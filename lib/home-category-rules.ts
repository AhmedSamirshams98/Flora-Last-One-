/* What a home category may be: a section (shoes or bags), optionally narrowed to one type of it, and
   the type has to belong to the section (not "bags" + "ballerinas"). "All shoes" / "all bags" is the
   whole section. The old separate loafers / sandals values are still accepted (they are the same
   shop sections as ballerinas / slippers). */

export const SECTION_TYPES: Record<"SHOE" | "BAG", string[]> = {
  SHOE: ["ALL_SHOES", "WINTER_BOOTS", "SNEAKERS", "PUMPS", "BALLERINAS", "LOAFERS", "SLIPPERS", "SANDALS"],
  BAG: ["ALL_BAGS", "HAND_BAGS", "SHOULDER_BAGS", "CROSSBODY_BAGS", "CLUTCH_BAGS", "BACKPACKS", "WALLETS"],
};

/** an error message in Arabic, or null when the pair is fine */
export function categoryProblem(category: unknown, subcategory: unknown): string | null {
  if (category !== "SHOE" && category !== "BAG") return "القسم غير صحيح";
  if (subcategory === null || subcategory === undefined || subcategory === "") return null;
  if (typeof subcategory !== "string" || !SECTION_TYPES[category].includes(subcategory)) {
    return "النوع الفرعي لا يتبع هذا القسم";
  }
  return null;
}
