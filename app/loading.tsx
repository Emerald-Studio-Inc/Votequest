import Skeleton from '@/components/Skeleton';

export default function Loading() {
    return (
        <div className="min-h-screen bg-[var(--bg-void)] text-white p-6 flex flex-col gap-6">
            <div className="h-20 w-full flex items-center justify-between">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-40 w-full" />
            </div>
            <div className="flex-1">
                <Skeleton className="h-full w-full rounded-2xl" />
            </div>
        </div>
    );
}
