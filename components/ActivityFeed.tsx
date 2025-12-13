import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

interface ActivityItem {
    action: string;
    timestamp: string;
    type: 'vote' | 'stake' | 'other';
}

interface ActivityFeedProps {
    items: ActivityItem[];
}

const NEON_CYAN = '#00F0FF';
const NEON_LIME = '#39FF14';

const ActivityFeed: React.FC<ActivityFeedProps> = ({ items }) => {
    return (
        <div className="space-y-4 font-mono">
            {items.map((item, index) => (
                <div key={index} className="flex items-start gap-3 text-sm group">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                        {item.type === 'vote' ? (
                            <CheckCircle size={16} style={{ color: NEON_CYAN }} />
                        ) : (
                            <Circle size={16} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <p className="text-gray-400 group-hover:text-white transition-colors uppercase tracking-tight text-xs">
                            {item.action}
                        </p>
                    </div>

                    {/* Timestamp */}
                    <div className="flex-shrink-0 text-[10px] text-gray-600 group-hover:text-gray-500 transition-colors uppercase">
                        {item.timestamp}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityFeed;
