import { useTranslation } from "react-i18next";
import {
    ArrowDown,
    ArrowUp,
    ArrowLeft,
    ArrowRight,
} from "@untitledui/icons";

import type { LayoutDirection } from "@/entities/family";
import { useFamilyContext } from "@/entities/family";
import { ButtonUtility } from "@/components/base/buttons/button-utility";
import { LanguageSwitcher } from "./language-switcher";

export function GraphToolbarMobile(): React.ReactNode {
    const { t } = useTranslation();
    const { data, setDirection } = useFamilyContext();

    const DIRECTION_BUTTONS: { value: LayoutDirection; icon: typeof ArrowDown; label: string }[] = [
        { value: "TB", icon: ArrowDown, label: t("toolbar.topToBottom") },
        { value: "BT", icon: ArrowUp, label: t("toolbar.bottomToTop") },
        { value: "LR", icon: ArrowRight, label: t("toolbar.leftToRight") },
        { value: "RL", icon: ArrowLeft, label: t("toolbar.rightToLeft") },
    ];

    const currentDirection = data.settings.direction;

    return (
        <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-around border-b border-secondary bg-primary px-4 pt-[max(env(safe-area-inset-top),8px)] pb-2 shadow-sm">
            {/* Logo */}
            <div className="flex items-center px-1">
                <img src="logo.png" alt={t("toolbar.logoAlt")} className="size-5" />
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-border-secondary" />

            {/* Direction Controls */}
            {DIRECTION_BUTTONS.map(({ value, icon, label }) => (
                <ButtonUtility
                    key={value}
                    icon={icon}
                    size="sm"
                    className="p-2.5! focus:outline-none"
                    color={currentDirection === value ? "secondary" : "tertiary"}
                    tooltip={label}
                    onClick={() => setDirection(value)}
                />
            ))}

            {/* Divider */}
            <div className="h-6 w-px bg-border-secondary" />

            {/* Language Switcher */}
            <LanguageSwitcher />
        </div>
    );
}
