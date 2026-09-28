import TransitionLink from "@/components/layout/TransitionLink";

export default function NotFound() {
  return (
    <main className="gutter flex min-h-[100svh] flex-col justify-end bg-paper pb-[var(--gutter)] pt-[var(--nav-h)]">
      <span className="label">404 · Nothing here</span>
      <h1 className="display-xl mt-4">
        Lost
        <br />
        <span className="font-display-i normal-case">the thread.</span>
      </h1>
      <TransitionLink href="/" label="Home" className="label-sans link-line mt-10 inline-block w-max">
        Back to the start ←
      </TransitionLink>
    </main>
  );
}
