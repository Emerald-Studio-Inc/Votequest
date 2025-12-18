import Tooltip from './Tooltip';
import { sfx } from '@/lib/sfx';
import { triggerHaptic } from '@/lib/haptics';

interface ArcadeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'cyan' | 'magenta' | 'lime';
    size?: 'sm' | 'md' | 'lg';
    glow?: boolean;
    children: React.ReactNode;
    tooltip?: string;
}

// Neon color hex values - guaranteed to work
const NEON_COLORS = {
    cyan: '#00F0FF',
    magenta: '#FF003C',
    lime: '#39FF14',
};

export default function ArcadeButton({
    variant = 'cyan',
    size = 'md',
    glow = false,
    className = '',
    children,
    style,
    tooltip,
    ...props
}: ArcadeButtonProps) {

    const color = NEON_COLORS[variant];

    const sizes = {
        sm: 'px-4 py-1 text-xs',
        md: 'px-6 py-2 text-sm',
        lg: 'px-8 py-3 text-base'
    };

    const ButtonContent = (
        <button
            className={`
                group relative uppercase tracking-widest font-bold font-mono transition-all duration-200
                border-2 ${sizes[size]}
                active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                overflow-hidden
                ${className}
            `}
            style={{
                color: color,
                borderColor: color,
                backgroundColor: '#000000', // Pure black for max contrast
                textShadow: `0 0 1px white, 0 0 5px ${color}`, // White core + colored glow = Readable Neon
                fontWeight: 700,
                ...style,
            }}
            onMouseEnter={() => sfx.playHover()}
            onClick={(e) => {
                sfx.playClick();
                triggerHaptic('light');
                if (props.onClick) props.onClick(e);
            }}
            {...props}
        >
            {/* Corner Accents */}
            <span
                className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 opacity-70"
                style={{ borderColor: color }}
            ></span>
            <span
                className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 opacity-70"
                style={{ borderColor: color }}
            ></span>

            {/* Button Content - with explicit color for guaranteed visibility */}
            <span
                className="relative z-10 flex items-center justify-center gap-2"
                style={{ color: color }}
            >
                {children}
            </span>
        </button>
    );

    if (tooltip) {
        return (
            <Tooltip content={tooltip}>
                {ButtonContent}
            </Tooltip>
        );
    }

    return ButtonContent;
}


