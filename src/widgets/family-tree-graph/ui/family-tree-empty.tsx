import { EmptyState } from '@/components/application/empty-state/empty-state';
import { Button } from '@/components/base/buttons/button';

interface FamilyTreeEmptyProps {
    onAddFirstPerson: () => void;
}

export function FamilyTreeEmpty({ onAddFirstPerson }: FamilyTreeEmptyProps) {
    return (
        <div className="flex h-full items-center justify-center bg-tertiary">
            <EmptyState size="lg">
                <EmptyState.Header pattern="circle">
                    <img src="/logo.png" alt="Family Tree" className="size-16" />
                </EmptyState.Header>
                <EmptyState.Content>
                    <EmptyState.Title>Start Your Family Tree</EmptyState.Title>
                    <EmptyState.Description>
                        Add your first family member to begin building your family tree
                    </EmptyState.Description>
                </EmptyState.Content>
                <EmptyState.Footer>
                    <Button color="primary" onClick={onAddFirstPerson}>
                        Add First Person
                    </Button>
                </EmptyState.Footer>
            </EmptyState>
        </div>
    );
}
