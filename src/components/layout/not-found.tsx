import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="gutter mx-auto max-w-xl py-24 text-center">
      <p className="eyebrow text-accent">404</p>
      <h1 className="mt-3 text-display-l">
        That page isn’t on the menu
      </h1>
      <p className="mt-4 text-muted">
        The link may be old, or the dish may have moved. Everything we cook is on the menu.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <Link to="/menu">Browse dishes</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link to="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
