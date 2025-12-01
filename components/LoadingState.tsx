// Skeleton Loaders for smooth loading states

export function ProposalCardSkeleton() {
    return (
        <div className="card p-6 animate-pulse">
            <div className="h-6 bg-white/10 rounded w-3/4 mb-4" />
            <div className="h-4 bg-white/5 rounded w-full mb-2" />
            <div className="h-4 bg-white/5 rounded w-5/6 mb-4" />
            <div className="flex gap-4">
                <div className="h-10 bg-white/5 rounded flex-1" />
                <div className="h-10 bg-white/5 rounded flex-1" />
            </div>
        </div>
    );
}

export function UserCardSkeleton() {
    return (
        <div className="card p-4 animate-pulse">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl" />
                <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-32 mb-2" />
                    <div className="h-3 bg-white/5 rounded w-24" />
                </div>
                <div className="h-6 bg-white/5 rounded w-16" />
            </div>
        </div>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="animated p-6">
            <div className="h-4 bg-white/10 rounded w-24 mb-2" />
            <div className="h-8 bg-white/5 rounded w-32" />
        </div>
    );
}

export function AchievementCardSkeleton() {
    return (
        <div className="card p-6 animate-pulse">
            <div className="w-16 h-16 bg-white/10 rounded-2xl mb-4" />
            <div className="h-5 bg-white/10 rounded w-3/4 mb-2" />
            <div className="h-4 bg-white/5 rounded w-full mb-4" />
            <div className="h-2 bg-white/5 rounded w-full" />
        </div>
    );
}

export function ReceiptCardSkeleton() {
    return (
        <div className="card p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl" />
                    <div>
                        <div className="h-4 bg-white/10 rounded w-32 mb-2" />
                        <div className="h-3 bg-white/5 rounded w-24" />
                    </div>
                </div>
                <div className="h-6 bg-white/5 rounded w-16" />
            </div>
            <div className="h-16 bg-white/5 rounded" />
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 animate-pulse">
            <div className="h-4 bg-white/10 rounded w-24" />
            <div className="h-4 bg-white/5 rounded w-32" />
            <div className="h-4 bg-white/5 rounded w-20" />
            <div className="h-4 bg-white/5 rounded w-16" />
            <div className="h-4 bg-white/5 rounded flex-1" />
        </div>
    );
}

// Loading States Component
interface LoadingStateProps {
    type: 'proposals' | 'users' | 'stats' | 'achievements' | 'receipts' | 'table';
    count?: number;
}

export default function LoadingState({ type, count = 3 }: LoadingStateProps) {
    const skeletons = Array.from({ length: count }, (_, i) => i);

    const renderSkeleton = () => {
        switch (type) {
            case 'proposals':
                return skeletons.map(i => <ProposalCardSkeleton key={i} />);
            case 'users':
                return skeletons.map(i => <UserCardSkeleton key={i} />);
            case 'stats':
                return skeletons.map(i => <StatCardSkeleton key={i} />);
            case 'achievements':
                return skeletons.map(i => <AchievementCardSkeleton key={i} />);
            case 'receipts':
                return skeletons.map(i => <ReceiptCardSkeleton key={i} />);
            case 'table':
                return skeletons.map(i => <TableRowSkeleton key={i} />);
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            {renderSkeleton()}
        </div>
    );
}
