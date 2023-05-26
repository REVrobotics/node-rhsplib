import { RevHub } from "@rev-robotics/expansion-hub";

export function hubHierarchyToString(hub: RevHub): string {
    let result = `USB Expansion Hub: ${hub.moduleAddress}\n`;

    if (hub.isExpansionHub()) {
        console.log(`Is open? ${hub.isOpen}`);
    }

    if (hub.isParent()) {
        for (const child of hub.children) {
            result += `\tUSB Expansion Hub: ${child.moduleAddress}\n`;
        }
    }

    return result;
}
