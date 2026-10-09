import Link from "next/link";

export default function AuthCodeErrorPage({
  searchParams,
}: {
  searchParams?: { message?: string };
}) {
  const message = searchParams?.message ? decodeURIComponent(searchParams.message) : null;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-3 text-2xl font-semibold text-gray-900">ההתחברות נכשלה</h1>
      <p className="mb-4 max-w-md text-sm text-gray-600">
        לא הצלחנו להשלים את ההתחברות עם Google. נסו שוב, או התחברו עם אימייל וסיסמה.
      </p>
      {message && (
        <p className="mb-8 max-w-md rounded-sm border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {message}
        </p>
      )}
      <Link
        href="/login"
        className="rounded-sm bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
      >
        חזרה להתחברות
      </Link>
    </div>
  );
}
