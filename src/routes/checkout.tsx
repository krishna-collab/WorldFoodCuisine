import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { cities, cityById, dishById } from "@/lib/food/data";
import { cartDelivery, cartSubtotal, useCart } from "@/lib/store/cart";
import { useCity } from "@/lib/store/city";
import { makeOrderId, useOrders } from "@/lib/store/orders";
import { formatPrice } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({ component: CheckoutPage });

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const cityId = useCity((s) => s.cityId);
  const setCity = useCity((s) => s.setCity);
  const place = useOrders((s) => s.place);
  const navigate = useNavigate();
  const city = cityById(cityId);
  const subtotal = cartSubtotal(items);
  const delivery = cartDelivery(subtotal);
  const total = subtotal + delivery;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [unit, setUnit] = useState("");
  const [window, setWindow] = useState("asap");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      setError("Your bag is empty.");
      return;
    }
    if (!name.trim() || !phone.trim() || !address.trim()) {
      setError("Name, phone, and street are required.");
      return;
    }
    const id = makeOrderId();
    place({
      id,
      createdAt: Date.now(),
      cityId,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      unit: unit.trim(),
      window,
      notes: notes.trim(),
      items,
      subtotal,
      delivery,
      total,
    });
    clear();
    void navigate({ to: "/order/$id", params: { id } });
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Nothing to check out</h1>
        <p className="mt-3 text-muted">Add a plate from the line, then come back.</p>
        <Button asChild className="mt-8">
          <Link to="/menu">Open the menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_22rem]">
      <div>
        <p className="text-xs font-medium tracking-widest text-subtle uppercase">Checkout</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">Send it to the door</h1>
        <p className="mt-2 text-sm text-muted">
          {city.hub} is cooking. Delivery only — about {city.eta} minutes to the door. No pickup.
        </p>

        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <select
              id="city"
              value={cityId}
              onChange={(e) => setCity(e.target.value)}
              className="h-11 w-full rounded-md bg-elevated px-3.5 text-sm text-fg shadow-[var(--shadow-border)]"
            >
              {cities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}, {c.state} · {c.hub}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="address">Street</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              autoComplete="street-address"
              placeholder="120 Hawthorne St"
            />
          </div>
          <div>
            <Label htmlFor="unit">Floor / unit</Label>
            <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <Label htmlFor="window">Delivery window</Label>
            <select
              id="window"
              value={window}
              onChange={(e) => setWindow(e.target.value)}
              className="h-11 w-full rounded-md bg-elevated px-3.5 text-sm text-fg shadow-[var(--shadow-border)]"
            >
              <option value="asap">As soon as the line allows</option>
              <option value="lunch">Lunch 11:00–14:30</option>
              <option value="dinner">Dinner 17:00–22:00</option>
            </select>
          </div>
          <div>
            <Label htmlFor="notes">Kitchen notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Allergies, gate code, extra chutney"
            />
          </div>
          {error ? <p className="text-sm text-muted">{error}</p> : null}
          <Button type="submit" size="lg" className="w-full sm:w-auto">
            Place order · {formatPrice(total)}
          </Button>
          <p className="text-xs text-subtle">
            Demo checkout — no card is charged. There is no dining room and no pickup. Live cities
            can also order the same kitchen on Uber Eats and DoorDash.
          </p>
        </form>
      </div>

      <aside className="h-fit rounded-2xl bg-surface p-5 shadow-[var(--shadow-border)]">
        <h2 className="font-display text-lg font-semibold">Bag</h2>
        <ul className="mt-4 space-y-3">
          {items.map((item) => {
            const dish = dishById[item.dishId];
            if (!dish) return null;
            return (
              <li key={item.dishId} className="flex justify-between gap-3 text-sm">
                <span className="text-muted">
                  {item.qty} × {dish.name}
                </span>
                <span className="tabular-nums">{formatPrice(dish.price * item.qty)}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span className="tabular-nums text-fg">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted">
            <span>Delivery</span>
            <span className="tabular-nums text-fg">{delivery === 0 ? "Free" : formatPrice(delivery)}</span>
          </div>
          <div className="flex justify-between pt-2 font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatPrice(total)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
