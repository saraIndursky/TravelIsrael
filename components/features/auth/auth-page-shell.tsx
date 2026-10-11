"use client";

import * as React from "react";
import { useId } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface AuthPageShellProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthPageShell({
  title,
  subtitle,
  backgroundImage,
  children,
  footer,
}: AuthPageShellProps) {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-white p-4">
      <div
        className="fixed inset-0 bg-cover bg-center opacity-15"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
        aria-hidden
      />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-semibold text-gray-900">TravelIsrael</h1>
          <div className="mx-auto h-0.5 w-12 bg-gray-900" />
        </div>

        <div className="rounded-sm border border-gray-200 bg-white p-8 md:p-10">
          <div className="mb-8">
            <h2 className="mb-2 text-3xl font-light text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>

          {children}

          {footer}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    </main>
  );
}

interface AuthFieldProps {
  label: string;
  error?: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export function AuthField({ label, error, icon, children }: AuthFieldProps) {
  const generatedId = useId();
  const input = React.isValidElement<{ id?: string }>(children) ? children : null;
  const fieldId = input?.props.id ?? generatedId;
  return (
    <div>
      <label htmlFor={fieldId} className="mb-2 block text-sm font-medium text-gray-600">
        {label}
      </label>
      <div className="relative">
        {input ? React.cloneElement(input, { id: fieldId }) : children}
        <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          {icon}
        </div>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export const authInputClassName =
  "w-full rounded-sm border border-gray-300 bg-white px-4 py-3 pr-11 text-gray-900 transition-colors placeholder:text-gray-500 focus:border-gray-900 focus:outline-none";

export const authSubmitClassName =
  "w-full rounded-sm bg-gray-900 py-3.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60";
