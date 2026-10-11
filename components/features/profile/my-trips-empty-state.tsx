import Link from "next/link";
import { Map } from "lucide-react";

interface MyTripsEmptyStateProps {
  title?: string;
  description?: string;
  showCreateButton?: boolean;
}

export function MyTripsEmptyState({
  title = "עדיין לא יצרת טיולים",
  description = "אפשר להתחיל לתכנן את הטיול הבא ולהוסיף אותו לרשימה.",
  showCreateButton = true,
}: MyTripsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded border border-dashed border-border bg-white px-6 py-16 text-center text-right">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Map className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mb-2 text-lg font-medium text-foreground">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      {showCreateButton && (
        <Link href="/trips/create" className="ti-btn-primary">
          יצירת טיול חדש
        </Link>
      )}
    </div>
  );
}
