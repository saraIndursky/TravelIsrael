import Link from "next/link";

export default function NotFound() {
  return (
    <div className="ti-container py-24 text-center space-y-6">
      <h1 className="text-5xl font-light">404</h1>
      <p className="text-muted-foreground">הדף לא נמצא</p>
      <Link href="/" className="ti-btn-primary inline-flex">חזרה לדף הבית</Link>
    </div>
  );
}
