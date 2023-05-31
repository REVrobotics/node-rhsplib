import { RevHub } from "@rev-robotics/expansion-hub";

export function hubHierarchyToString(hub: RevHub): string {
    let result = `RevHub: ${hub.moduleAddress}\n`;

    if (hub.isParent()) {
        for (const child of hub.children) {
            result += `\tRevHub: ${child.moduleAddress}\n`;
        }
    }

    return result;
}
