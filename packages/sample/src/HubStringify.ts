import { RevHub } from "@rev-robotics/expansion-hub";

export function hubHierarchyToString(hub: RevHub): string {
    let serialNumberText: string = "";
    if (hub.isParent()) {
        serialNumberText = `(${hub.serialNumber})`;
    }
    let result = `RevHub ${serialNumberText}: ${hub.moduleAddress}\n`;

    if (hub.isParent()) {
        for (const child of hub.children) {
            result += `\tRevHub: ${child.moduleAddress}\n`;
        }
    }

    return result;
}
