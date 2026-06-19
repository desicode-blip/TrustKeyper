import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PropertyEditSaveDiscardBar({
  onSave,
  onDiscard,
  saving = false,
  className,
}: {
  onSave: () => void;
  onDiscard: () => void;
  saving?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end gap-3 w-full",
        className,
      )}
    >
      <Button
        type="button"
        variant="destructive"
        disabled={saving}
        onClick={onDiscard}
        className="h-10 min-h-10 w-full sm:w-auto rounded-[4px] text-sm font-semibold"
      >
        Discard Changes
      </Button>
      <Button
        type="button"
        disabled={saving}
        onClick={onSave}
        className="h-10 min-h-10 w-full sm:w-auto rounded-[4px] text-sm font-semibold bg-primary hover:bg-primary/90 shadow-md shadow-primary/25"
      >
        {saving ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden />
            Saving…
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </div>
  );
}
