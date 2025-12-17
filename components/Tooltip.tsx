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
                absolute z-50 px-3 py-1.5 text-xs font-mono font-bold tracking-wider text-cyan-400 bg-black/95 border border-cyan-500/50 rounded-none 
                opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap shadow-[0_0_15px_rgba(0,240,255,0.3)]
                ${position === 'top' ? 'bottom-full left-1/2 -translate-x-1/2 mb-2 translate-y-1 group-hover:translate-y-0' : ''}
                ${position === 'bottom' ? 'top-full left-1/2 -translate-x-1/2 mt-2 -translate-y-1 group-hover:translate-y-0' : ''}
                ${position === 'left' ? 'right-full top-1/2 -translate-y-1/2 mr-2 translate-x-1 group-hover:translate-x-0' : ''}
                ${position === 'right' ? 'left-full top-1/2 -translate-y-1/2 ml-2 -translate-x-1 group-hover:translate-x-0' : ''}
            `}>
                {content}
                {/* Arrow */}
                <div className={`
                    absolute w-2 h-2 bg-black border-r border-b border-cyan-500/50 transform rotate-45
                    ${position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2' : ''}
                    ${position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2 border-r-0 border-b-0 border-l border-t' : ''}
                    ${position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2 border-r-0 border-b-0 border-l border-t' : ''}
                    ${position === 'right' ? 'left-[-5px] top-1/2 -translate-y-1/2' : ''}
                `}></div>
            </div>
        </div>
    );
};

export default Tooltip;
