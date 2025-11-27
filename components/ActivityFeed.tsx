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

const ActivityFeed: React.FC<ActivityFeedProps> = ({ items }) => {
    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                        {item.type === 'vote' ? (
                            <CheckCircle size={16} className="text-gold-400" />
                        ) : (
                            <Circle size={16} className="text-gray-600" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <p className="text-gray-300">{item.action}</p>
                    </div>

                    {/* Timestamp */}
                    <div className="flex-shrink-0 text-gray-500 text-xs">
                        {item.timestamp}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityFeed;
