import React from 'react';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip: React.FC<TooltipProps> = ({ content, children, position = 'top' }) => {
    return (
        <div className="relative group inline-flex items-center">
            {children}
            <div className={`
                absolute z-50 px-3 py-1.5 text-xs font-medium text-black bg-white rounded-lg 
                opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-xl
                ${position === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2 translate-y-1 group-hover:translate-y-0' : ''}
                ${position === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2 -translate-y-1 group-hover:translate-y-0' : ''}
                ${position === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2 translate-x-1 group-hover:translate-x-0' : ''}
                ${position === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-2 -translate-x-1 group-hover:translate-x-0' : ''}
            `}>
                {content}
                {/* Arrow */}
                <div className={`
                    absolute w-2 h-2 bg-white transform rotate-45
                    ${position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' : ''}
                    ${position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' : ''}
                    ${position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' : ''}
                    ${position === 'right' ? 'left-[-4px] top-1/2 -translate-y-1/2' : ''}
                `}></div>
            </div>
        </div>
    );
};

export default Tooltip;
