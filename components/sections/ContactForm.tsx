"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/data/site";
import { MagneticButton } from "@/components/motion/Magnetic";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "sent" | "failed";

// Submissions go to Netlify Forms, which emails them on. Netlify only detects
// forms in static HTML, so this form is also declared in public/__forms.html
// and posts there; the field names must match that file.
const FORM_NAME = "contact";
const ENDPOINT = "/__forms.html";

const copy = site.contact.form;
const field =
  "mt-2 w-full border-b border-paper/25 bg-transparent py-3 text-[clamp(1rem,1.2vw,1.15rem)] text-paper outline-none transition-colors placeholder:text-paper/30 focus:border-paper";

/** Name, email and message, sent without leaving the page. */
export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const fields = [...new FormData(form).entries()].map(([k, v]) => [k, String(v)]);
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(fields).toString(),
      });
      if (!res.ok) throw new Error(`form post failed: ${res.status}`);
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("failed");
    }
  };

  const sending = status === "sending";
  const label = sending ? copy.sending : copy.send;

  return (
    <form name={FORM_NAME} method="POST" onSubmit={submit} className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
      <input type="hidden" name="form-name" value={FORM_NAME} />
      {/* spam trap: hidden from people, so anything filled in here came from a bot */}
      <p className="hidden" aria-hidden>
        <label>
          Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </p>

      <label className="block">
        <span className="label text-paper/55">{copy.name}</span>
        <input name="name" type="text" required autoComplete="name" maxLength={120} className={field} />
      </label>
      <label className="block">
        <span className="label text-paper/55">{copy.email}</span>
        <input name="email" type="email" required autoComplete="email" maxLength={200} className={field} />
      </label>
      <label className="block sm:col-span-2">
        <span className="label text-paper/55">{copy.message}</span>
        {/* data-lenis-prevent lets a long message scroll inside the box */}
        <textarea name="message" required rows={5} maxLength={5000} data-lenis-prevent className={cn(field, "resize-none")} />
      </label>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:col-span-2">
        <MagneticButton
          type="submit"
          disabled={sending}
          strength={0.25}
          className="group label-sans rounded-full border border-paper/30 px-6 py-3 transition-colors hover:bg-paper disabled:opacity-50"
          // the colour goes on the inner span: globals.css sets `button { color: inherit }`
          // outside any layer, which outranks a hover text colour on the button itself
          innerClassName="gap-2 transition-colors group-hover:text-ink"
        >
          <span className="flip">
            <span>{label}</span>
            <span aria-hidden>{label}</span>
          </span>
          <ArrowUpRight size={14} strokeWidth={1.5} aria-hidden />
        </MagneticButton>
        <p role="status" aria-live="polite" className={cn("text-sm", status === "failed" ? "text-accent" : "text-paper/70")}>
          {status === "sent" && copy.sent}
          {status === "failed" && (
            <>
              {copy.failed}{" "}
              <a href={`mailto:${site.email}`} className="underline underline-offset-4">
                {site.email}
              </a>
              .
            </>
          )}
        </p>
      </div>
    </form>
  );
}
