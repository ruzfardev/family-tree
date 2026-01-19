import { useIsMobile } from "@/hooks/use-is-mobile";
import { FamilyTreeGraph as FamilyTreeGraphDesktop } from "./ui/family-tree-graph";
import { FamilyTreeGraphMobile } from "./ui/family-tree-graph-mobile";

export function FamilyTreeGraph(): React.ReactNode {
    const isMobile = useIsMobile();
    return isMobile ? <FamilyTreeGraphMobile /> : <FamilyTreeGraphDesktop />;
}
