import Btn from "@/components/ui/btn";
import { Ghost } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-6">
          <Ghost size={28} className="text-accent" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-3">Page not found</h2>
        <p className="text-text-secondary text-sm mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <Btn>Back to Home</Btn>
        </Link>
      </div>
    </div>
  );
}
