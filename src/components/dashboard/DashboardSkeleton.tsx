import { Skeleton } from "@/components/ui/skeleton";
import styles from "@/styles/skeletons.module.css";

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <div className="space-y-4 w-full max-w-2xl">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-16 w-full max-w-md" />
          <Skeleton className="h-4 w-full max-w-xs" />
        </div>
        <Skeleton className="w-[180px] h-[160px] rounded-[2.5rem]" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-[#1E2A3A]/5 space-y-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-10 w-24 rounded-full" />
            </div>
            <div className="flex flex-wrap gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-2xl" />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-[2.5rem] border border-[#1E2A3A]/5 space-y-6">
              <Skeleton className="h-8 w-40" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-[#1E2A3A]/5 space-y-6">
              <Skeleton className="h-8 w-40" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Skeleton className="h-[200px] w-full rounded-[2.5rem]" />
          <Skeleton className="h-[160px] w-full rounded-[2.5rem]" />
        </div>
      </div>
    </div>
  );
};
