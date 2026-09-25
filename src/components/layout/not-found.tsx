import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-medium tracking-widest text-accent uppercase">404</p>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight">
        That page isn’t on the menu
      </h1>
      <p className="mt-4 text-muted">
        The link may be old, or the dish may have moved. Everything we cook is on the menu.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link to="/menu">Browse the menu</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link to="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
