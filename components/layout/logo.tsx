import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "default" | "footer";
  className?: string;
}

function LogoImage({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="TravelIsrael"
      width={220}
      height={56}
      className={cn("h-10 w-auto object-contain", className)}
      priority
    />
  );
}

export function Logo({ variant = "default", className }: LogoProps) {
  if (variant === "footer") {
    return (
      <div className={className}>
        <div className="text-xl font-semibold text-gray-900 mb-4">TravelIsrael</div>
        <p className="text-sm text-gray-600 leading-relaxed">פלטפורמה לתכנון טיולים יומיים בישראל</p>
      </div>
    );
  }

  return (
    <Link
      href="/"
      className={cn("flex items-center shrink-0 bg-gray-900 px-2 py-1 rounded", className)}
    >
      <LogoImage className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
    </Link>
  );
}
