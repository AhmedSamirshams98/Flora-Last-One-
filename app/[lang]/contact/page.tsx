import { redirect } from "next/navigation";

/* The contact page was folded into the footer (id="contact", on every page) and the floating
   call / WhatsApp buttons. This keeps old links and bookmarks working. */
export default async function ContactRedirect({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  redirect(`/${lang === "en" ? "en" : "ar"}#contact`);
}
