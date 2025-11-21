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
                absolute z-50 px-3 py-1.5 text-[10px] uppercase tracking-wider font-medium text-white bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-xl
                ${position === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2 translate-y-1 group-hover:translate-y-0' : ''}
                ${position === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2 -translate-y-1 group-hover:translate-y-0' : ''}
                ${position === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2 translate-x-1 group-hover:translate-x-0' : ''}
                ${position === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-2 -translate-x-1 group-hover:translate-x-0' : ''}
            `}>
                {content}
                {/* Arrow */}
                <div className={`
                    absolute w-2 h-2 bg-zinc-900/90 border-r border-b border-white/10 transform rotate-45
                    ${position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2 border-t-0 border-l-0' : ''}
                    ${position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-b-0 border-r-0 rotate-[225deg]' : ''}
                    ${position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-l-0 border-b-0 rotate-[-45deg]' : ''}
                    ${position === 'right' ? 'left-[-5px] top-1/2 -translate-y-1/2 border-r-0 border-t-0 rotate-[135deg]' : ''}
                `}></div>
            </div>
        </div>
    );
};

export default Tooltip;
