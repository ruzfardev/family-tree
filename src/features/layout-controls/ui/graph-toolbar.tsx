import { useState } from 'react';
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react';
import { toPng } from 'html-to-image';
import {
    ArrowDown,
    ArrowUp,
    ArrowLeft,
    ArrowRight,
    ZoomIn,
    ZoomOut,
    Expand01,
    Sun,
    Moon01,
    Download01,
    Loading02,
} from '@untitledui/icons';

import type { LayoutDirection } from '@/entities/family';
import { useFamilyContext } from '@/entities/family';
import { ButtonUtility } from '@/components/base/buttons/button-utility';
import { useTheme } from '@/providers/theme-provider';

const DIRECTION_BUTTONS: { value: LayoutDirection; icon: typeof ArrowDown; label: string }[] = [
    { value: 'TB', icon: ArrowDown, label: 'Top to Bottom' },
    { value: 'BT', icon: ArrowUp, label: 'Bottom to Top' },
    { value: 'LR', icon: ArrowRight, label: 'Left to Right' },
    { value: 'RL', icon: ArrowLeft, label: 'Right to Left' },
];

export function GraphToolbar(): React.ReactNode {
    const { data, setDirection } = useFamilyContext();
    const { zoomIn, zoomOut, fitView, getNodes } = useReactFlow();
    const { theme, setTheme } = useTheme();
    const [isExporting, setIsExporting] = useState(false);

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

    const handleDownloadImage = async () => {
        const nodes = getNodes();
        if (nodes.length === 0 || isExporting) return;

        setIsExporting(true);

        const nodesBounds = getNodesBounds(nodes);
        // Add padding to bounds
        const padding = 100;
        const paddedBounds = {
            x: nodesBounds.x - padding,
            y: nodesBounds.y - padding,
            width: nodesBounds.width + padding * 2,
            height: nodesBounds.height + padding * 2,
        };

        // Calculate image dimensions based on content aspect ratio
        // Use 2x scale for higher quality (retina)
        const scale = 2;
        const minWidth = 1920;
        const minHeight = 1080;

        // Calculate dimensions maintaining aspect ratio
        const aspectRatio = paddedBounds.width / paddedBounds.height;
        let imageWidth: number;
        let imageHeight: number;

        if (aspectRatio > minWidth / minHeight) {
            // Wider than target - fit to width
            imageWidth = Math.max(paddedBounds.width * scale, minWidth);
            imageHeight = imageWidth / aspectRatio;
        } else {
            // Taller than target - fit to height
            imageHeight = Math.max(paddedBounds.height * scale, minHeight);
            imageWidth = imageHeight * aspectRatio;
        }

        const viewport = getViewportForBounds(paddedBounds, imageWidth, imageHeight, 0.5, 2, 0);

        const viewportElement = document.querySelector('.react-flow__viewport') as HTMLElement;
        if (!viewportElement) {
            setIsExporting(false);
            return;
        }

        try {
            const dataUrl = await toPng(viewportElement, {
                backgroundColor: theme === 'dark' ? '#0a0a0a' : '#f9fafb',
                width: imageWidth,
                height: imageHeight,
                pixelRatio: scale,
                style: {
                    width: `${imageWidth}px`,
                    height: `${imageHeight}px`,
                    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                },
            });

            const link = document.createElement('a');
            link.download = 'family-tree.png';
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to export image:', error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex items-center gap-1 rounded-lg border border-secondary bg-primary p-1 shadow-xs">
            {/* Logo */}
            <div className="flex items-center px-1">
                <img src="/logo.png" alt="Family Tree" className="size-6" />
            </div>

            {/* Divider */}
            <div className="mx-1 h-5 w-px bg-border-secondary" />

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

            {/* Divider */}
            <div className="mx-1 h-5 w-px bg-border-secondary" />

            {/* Download */}
            <ButtonUtility
                icon={isExporting ? Loading02 : Download01}
                size="sm"
                color="tertiary"
                tooltip={isExporting ? 'Exporting...' : 'Download as Image'}
                onClick={handleDownloadImage}
                className={isExporting ? 'animate-spin' : ''}
            />

            {/* Export Loading Overlay */}
            {isExporting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3 rounded-xl bg-primary p-6 shadow-lg">
                        <Loading02 className="size-8 animate-spin text-brand-solid" />
                        <span className="text-sm font-medium text-primary">Exporting image...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
