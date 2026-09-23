import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { dishById } from "@/lib/food/data";
import { useCart } from "@/lib/store/cart";
import { cn } from "@/lib/utils";

export function AddButton({
  dishId,
  className,
  size = "sm",
}: {
  dishId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const add = useCart((s) => s.add);
  const dish = dishById[dishId];

  return (
    <Button
      size={size}
      className={cn("min-w-11", className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add(dishId);
        toast.success(dish ? `${dish.name} added` : "Added to bag");
      }}
    >
      <Plus className="size-4" strokeWidth={2} />
      Add
    </Button>
  );
}
