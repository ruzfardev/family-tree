import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useReactFlow, getNodesBounds, getViewportForBounds } from "@xyflow/react";
import { toPng } from "html-to-image";
import {
    ZoomIn,
    ZoomOut,
    Expand01,
    Sun,
    Moon01,
    Download01,
    Loading02,
} from "@untitledui/icons";

import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { useTheme } from "@/providers/theme-provider";

export function MobileBottomNav(): React.ReactNode {
    const { t } = useTranslation();
    const { zoomIn, zoomOut, fitView, getNodes } = useReactFlow();
    const { theme, setTheme } = useTheme();
    const [isExporting, setIsExporting] = useState(false);

    const toggleTheme = () => {
        if (theme === "light") {
            setTheme("dark");
        } else if (theme === "dark") {
            setTheme("system");
        } else {
            setTheme("light");
        }
    };

    const getThemeIcon = () => (theme === "dark" ? Moon01 : Sun);

    const getThemeTooltip = () => {
        if (theme === "light") return t("toolbar.themeLightMobile");
        if (theme === "dark") return t("toolbar.themeDarkMobile");
        return t("toolbar.themeSystemMobile");
    };

    const handleDownloadImage = async () => {
        const nodes = getNodes();
        if (nodes.length === 0 || isExporting) return;

        setIsExporting(true);

        const nodesBounds = getNodesBounds(nodes);
        const padding = 100;
        const paddedBounds = {
            x: nodesBounds.x - padding,
            y: nodesBounds.y - padding,
            width: nodesBounds.width + padding * 2,
            height: nodesBounds.height + padding * 2,
        };

        const scale = 2;
        const minWidth = 1920;
        const minHeight = 1080;

        const aspectRatio = paddedBounds.width / paddedBounds.height;
        let imageWidth: number;
        let imageHeight: number;

        if (aspectRatio > minWidth / minHeight) {
            imageWidth = Math.max(paddedBounds.width * scale, minWidth);
            imageHeight = imageWidth / aspectRatio;
        } else {
            imageHeight = Math.max(paddedBounds.height * scale, minHeight);
            imageWidth = imageHeight * aspectRatio;
        }

        const viewport = getViewportForBounds(paddedBounds, imageWidth, imageHeight, 0.5, 2, 0);

        const viewportElement = document.querySelector(".react-flow__viewport") as HTMLElement;
        if (!viewportElement) {
            setIsExporting(false);
            return;
        }

        try {
            const dataUrl = await toPng(viewportElement, {
                backgroundColor: theme === "dark" ? "#0a0a0a" : "#f9fafb",
                width: imageWidth,
                height: imageHeight,
                pixelRatio: scale,
                style: {
                    width: `${imageWidth}px`,
                    height: `${imageHeight}px`,
                    transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                },
            });

            const link = document.createElement("a");
            link.download = "family-tree.png";
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Failed to export image:", error);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-secondary bg-primary px-4 pt-2 pb-[max(env(safe-area-inset-bottom),8px)] shadow-lg">
                {/* Zoom Controls */}
                <ButtonUtility icon={ZoomIn} size="sm" className="p-3! focus:outline-none" color="tertiary" tooltip={t("toolbar.zoomIn")} onClick={() => zoomIn()} />
                <ButtonUtility icon={ZoomOut} size="sm" className="p-3! focus:outline-none" color="tertiary" tooltip={t("toolbar.zoomOut")} onClick={() => zoomOut()} />
                <ButtonUtility
                    icon={Expand01}
                    size="sm"
                    className="p-3! focus:outline-none"
                    color="tertiary"
                    tooltip={t("toolbar.fitView")}
                    onClick={() => fitView({ padding: 0.2, duration: 500 })}
                />

                {/* Divider */}
                <div className="h-6 w-px bg-border-secondary" />

                {/* Theme Toggle */}
                <ButtonUtility icon={getThemeIcon()} size="sm" className="p-3! focus:outline-none" color="tertiary" tooltip={getThemeTooltip()} onClick={toggleTheme} />

                {/* Divider */}
                <div className="h-6 w-px bg-border-secondary" />

                {/* Download */}
                <ButtonUtility
                    icon={isExporting ? Loading02 : Download01}
                    size="sm"
                    className={`p-3! focus:outline-none ${isExporting ? "animate-spin" : ""}`}
                    color="tertiary"
                    tooltip={isExporting ? t("toolbar.exporting") : t("toolbar.downloadImage")}
                    onClick={handleDownloadImage}
                />
            </div>

            {/* Export Loading Overlay */}
            {isExporting && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3 rounded-xl bg-primary p-6 shadow-lg">
                        <Loading02 className="size-8 animate-spin text-brand-solid" />
                        <span className="text-sm font-medium text-primary">{t("toolbar.exportingImage")}</span>
                    </div>
                </div>
            )}
        </>
    );
}
