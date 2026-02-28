import { useTranslation } from 'react-i18next';
import { EmptyState } from '@/components/application/empty-state/empty-state';
import { Button } from '@/components/base/buttons/button';

interface FamilyTreeEmptyProps {
    onAddFirstPerson: () => void;
}

export function FamilyTreeEmpty({ onAddFirstPerson }: FamilyTreeEmptyProps) {
    const { t } = useTranslation();

    return (
        <div className="flex h-full items-center justify-center bg-tertiary">
            <EmptyState size="lg">
                <EmptyState.Header pattern="circle">
                    <img src="logo.png" alt={t('familyTreeEmpty.logoAlt')} className="size-16" />
                </EmptyState.Header>
                <EmptyState.Content>
                    <EmptyState.Title>{t('familyTreeEmpty.title')}</EmptyState.Title>
                    <EmptyState.Description>
                        {t('familyTreeEmpty.description')}
                    </EmptyState.Description>
                </EmptyState.Content>
                <EmptyState.Footer>
                    <Button color="primary" onClick={onAddFirstPerson}>
                        {t('familyTreeEmpty.addFirst')}
                    </Button>
                </EmptyState.Footer>
            </EmptyState>
        </div>
    );
}
