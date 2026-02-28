import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Trash01, User01, User02, X, ChevronDown } from "@untitledui/icons";

import type { Gender, Person } from "@/entities/person";
import { useFamilyContext } from "@/entities/family";
import { useAuthContext } from "@/features/auth";
import { Avatar } from "@/components/base/avatar/avatar";
import { Button } from "@/components/base/buttons/button";
import { ButtonGroup, ButtonGroupItem } from "@/components/base/button-group/button-group";
import { Input } from "@/components/base/input/input";
import { formatDateRange } from "@/shared/lib/format-date";
import { cx } from "@/utils/cx";

export function BottomSheetPanel(): React.ReactNode {
    const { t } = useTranslation();
    const { isGuest } = useAuthContext();
    const { selectedPersonId, setSelectedPersonId, getPersonById, updatePerson, deletePerson } = useFamilyContext();

    if (isGuest) return null;

    const person = selectedPersonId ? getPersonById(selectedPersonId) : null;
    const [isExpanded, setIsExpanded] = useState(false);
    const [formData, setFormData] = useState<Partial<Person>>({});
    const [dragStartY, setDragStartY] = useState(0);

    useEffect(() => {
        if (person) {
            setFormData({
                name: person.name,
                birthDate: person.birthDate,
                deathDate: person.deathDate,
                gender: person.gender,
            });
            setIsExpanded(true);
        } else {
            setIsExpanded(false);
        }
    }, [person]);

    const handleChange = useCallback(
        (field: keyof Person, value: string) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
            if (selectedPersonId) {
                updatePerson(selectedPersonId, { [field]: value || undefined });
            }
        },
        [selectedPersonId, updatePerson]
    );

    const handleDelete = useCallback(() => {
        if (selectedPersonId && confirm(t("editPerson.deleteConfirm"))) {
            deletePerson(selectedPersonId);
        }
    }, [selectedPersonId, deletePerson]);

    const handleClose = useCallback(() => {
        setSelectedPersonId(null);
        setIsExpanded(false);
    }, [setSelectedPersonId]);

    const handleDragStart = (e: React.PointerEvent) => setDragStartY(e.clientY);
    const handleDragEnd = (e: React.PointerEvent) => {
        if (e.clientY - dragStartY > 80) handleClose();
    };

    if (!person) {
        return null;
    }

    const GenderIcon = person.gender === "female" ? User02 : User01;

    return (
        <>
            {/* Backdrop */}
            {isExpanded && <div className="fixed inset-0 z-40 bg-black/30" onClick={handleClose} />}

            {/* Bottom Sheet */}
            <div
                className={cx(
                    "fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border-t border-secondary bg-primary shadow-2xl transition-transform duration-300 ease-out",
                    "pb-[env(safe-area-inset-bottom)]",
                    isExpanded ? "translate-y-0" : "translate-y-full"
                )}
                style={{ maxHeight: "85dvh" }}
            >
                {/* Drag Handle */}
                <div
                    className="flex cursor-grab justify-center py-3 touch-none"
                    onPointerDown={handleDragStart}
                    onPointerUp={handleDragEnd}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <div className="h-1 w-10 rounded-full bg-quaternary" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between border-b border-secondary px-4 pb-4">
                    <div className="flex items-center gap-3">
                        <Avatar size="md" placeholderIcon={GenderIcon} contrastBorder />
                        <div>
                            <h3 className="text-sm font-semibold text-primary">{person.name}</h3>
                            <p className="text-xs text-tertiary">{formatDateRange(person.birthDate, person.deathDate)}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            color="tertiary"
                            iconLeading={ChevronDown}
                            onClick={() => setIsExpanded(false)}
                            aria-label={t("editPerson.minimize")}
                        />
                        <Button color="tertiary" iconLeading={X} onClick={handleClose} aria-label={t("editPerson.closePanel")} />
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {/* Form */}
                    <div className="flex flex-col gap-4 p-4">
                        <Input
                            label={t("common.name")}
                            placeholder={t("common.namePlaceholder")}
                            value={formData.name ?? ""}
                            onChange={(value) => handleChange("name", value)}
                        />

                        <Input
                            label={t("editPerson.birthDate")}
                            placeholder={t("common.yearPlaceholder")}
                            value={formData.birthDate ?? ""}
                            onChange={(value) => handleChange("birthDate", value)}
                        />

                        <Input
                            label={t("editPerson.deathDate")}
                            placeholder={t("common.deathPlaceholder")}
                            value={formData.deathDate ?? ""}
                            onChange={(value) => handleChange("deathDate", value)}
                        />

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-secondary">{t("common.gender")}</label>
                            <ButtonGroup
                                selectedKeys={formData.gender ? [formData.gender] : []}
                                onSelectionChange={(keys) => {
                                    const selected = [...keys][0] as Gender;
                                    if (selected) handleChange("gender", selected);
                                }}
                            >
                                <ButtonGroupItem id="male" iconLeading={User01}>
                                    {t("common.male")}
                                </ButtonGroupItem>
                                <ButtonGroupItem id="female" iconLeading={User02}>
                                    {t("common.female")}
                                </ButtonGroupItem>
                            </ButtonGroup>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-secondary p-4">
                        <Button color="primary-destructive" iconLeading={Trash01} className="w-full" onClick={handleDelete}>
                            {t("editPerson.deletePerson")}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
