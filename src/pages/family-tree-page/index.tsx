import { FamilyProvider } from '@/entities/family';
import { FamilyTreeGraph } from '@/widgets/family-tree-graph';

export function FamilyTreePage(): React.ReactNode {
    return (
        <FamilyProvider>
            <div className="h-screen w-screen">
                <FamilyTreeGraph />
            </div>
        </FamilyProvider>
    );
}
