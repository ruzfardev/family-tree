import { useReactFlow } from '@xyflow/react';
import {
    FlexAlignBottom,
    FlexAlignTop,
    FlexAlignLeft,
    FlexAlignRight,
    ZoomIn,
    ZoomOut,
    Expand01,
    Sun,
    Moon01,
} from '@untitledui/icons';

import type { LayoutDirection } from '@/entities/family';
import { useFamilyContext } from '@/entities/family';
import { ButtonUtility } from '@/components/base/buttons/button-utility';
import { useTheme } from '@/providers/theme-provider';

const DIRECTION_BUTTONS: { value: LayoutDirection; icon: typeof FlexAlignBottom; label: string }[] = [
    { value: 'TB', icon: FlexAlignBottom, label: 'Top to Bottom' },
    { value: 'BT', icon: FlexAlignTop, label: 'Bottom to Top' },
    { value: 'LR', icon: FlexAlignRight, label: 'Left to Right' },
    { value: 'RL', icon: FlexAlignLeft, label: 'Right to Left' },
];

export function GraphToolbar(): React.ReactNode {
    const { data, setDirection } = useFamilyContext();
    const { zoomIn, zoomOut, fitView } = useReactFlow();
    const { theme, setTheme } = useTheme();

    const currentDirection = data.settings.direction;

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
        } else if (theme === 'dark') {
            setTheme('system');
        } else {
            setTheme('light');
        }
    };

    const getThemeIcon = () => {
        if (theme === 'dark') return Moon01;
        return Sun;
    };

    const getThemeTooltip = () => {
        if (theme === 'light') return 'Light mode (click for dark)';
        if (theme === 'dark') return 'Dark mode (click for system)';
        return 'System mode (click for light)';
    };

    return (
        <div className="flex items-center gap-1 rounded-lg border border-secondary bg-primary p-1 shadow-xs">
            {/* Direction Controls */}
            {DIRECTION_BUTTONS.map(({ value, icon, label }) => (
                <ButtonUtility
                    key={value}
                    icon={icon}
                    size="sm"
                    color={currentDirection === value ? 'secondary' : 'tertiary'}
                    tooltip={label}
                    onClick={() => setDirection(value)}
                />
            ))}

            {/* Divider */}
            <div className="mx-1 h-5 w-px bg-border-secondary" />

            {/* Zoom Controls */}
            <ButtonUtility
                icon={ZoomIn}
                size="sm"
                color="tertiary"
                tooltip="Zoom In"
                onClick={() => zoomIn()}
            />
            <ButtonUtility
                icon={ZoomOut}
                size="sm"
                color="tertiary"
                tooltip="Zoom Out"
                onClick={() => zoomOut()}
            />
            <ButtonUtility
                icon={Expand01}
                size="sm"
                color="tertiary"
                tooltip="Fit View"
                onClick={() => fitView({ padding: 0.2, duration: 500 })}
            />

            {/* Divider */}
            <div className="mx-1 h-5 w-px bg-border-secondary" />

            {/* Theme Toggle */}
            <ButtonUtility
                icon={getThemeIcon()}
                size="sm"
                color="tertiary"
                tooltip={getThemeTooltip()}
                onClick={toggleTheme}
            />

        </div>
    );
}
