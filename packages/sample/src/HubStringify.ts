import { RevHub } from "@rev-robotics/expansion-hub";

export function hubHierarchyToString(hub: RevHub): string {
    let result = `RevHub: ${hub.moduleAddress}\n`;

    if (hub.isExpansionHub()) {
        console.log(`Is open? ${hub.isOpen}`);
    }

    if (hub.isParent()) {
        console.log(hub.serialNumber);
        for (const child of hub.children) {
            result += `\tRevHub: ${child.moduleAddress}\n`;
        }
    }

    return result;
}
