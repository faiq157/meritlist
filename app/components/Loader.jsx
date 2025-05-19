import { cn } from "@/lib/utils";

export default function Loading({ className }) {
  return (
    <div className={cn("flex justify-center items-center py-4", className)}>
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
    </div>
  );
}