"use client";
import { useSearchParams } from "next/navigation";

export default function RegisterError() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  if (!error) return null;
  return (
    <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm shadow-sm" role="alert">
      <p>{decodeURIComponent(error)}</p>
    </div>
  );
} 