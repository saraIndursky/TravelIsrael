"use client";

import Image from "next/image";
import type { Trip } from "@/types";

interface TripCardShellProps {
  trip: Trip;
  headerExtra?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}

/** מבנה כרטיס טיול אחיד — תמונה, תוכן, קו מפריד, פעולות בתחתית */
export function TripCardShell({ trip, headerExtra, subtitle, children, footer }: TripCardShellProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded border border-[#e5e7eb] bg-white transition-all duration-300 hover:border-[#d1d5db]">
      <div className="relative h-[300px] w-full overflow-hidden bg-[#f3f4f6]">
        <Image
          src={trip.main_image}
          alt={trip.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width:768px) 100vw, 33vw"
        />
        <span className="absolute top-3 right-3 rounded-full bg-white px-3 py-1 text-sm font-semibold text-gray-800">
          {trip.region}
        </span>
      </div>

      <div className="flex flex-grow flex-col p-5 text-right">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-medium text-[#111827] transition-colors group-hover:text-[#4b5563]">
            {trip.name}
          </h3>
          {headerExtra}
        </div>
        {subtitle && <div className="mt-1">{subtitle}</div>}

        <div className="flex-grow" />

        <div className="mt-4">{children}</div>

        <div className="mt-4 flex flex-col gap-2 border-t border-[#e5e7eb] pt-3">{footer}</div>
      </div>
    </article>
  );
}

export const tripCardActionClass =
  "flex w-full items-center justify-center gap-1.5 rounded border border-[#e5e7eb] bg-[#f9fafb] py-2.5 text-center text-sm font-medium text-[#111827] transition-colors hover:bg-[#f3f4f6] disabled:opacity-60";

export const tripCardActionPrimaryClass =
  "flex w-full items-center justify-center gap-1.5 rounded bg-[#111827] py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#1f2937] disabled:opacity-60";

export const tripCardActionDangerClass =
  "flex w-full items-center justify-center gap-1.5 rounded border border-red-200 bg-red-50 py-2.5 text-center text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-60";
