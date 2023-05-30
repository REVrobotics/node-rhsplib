import { RevHub } from "@rev-robotics/rev-hub-core";

export function hubHierarchyToString(hub: RevHub): string {
    let serialNumberText: string = "";
    if (hub.isParent()) {
        serialNumberText = `(${hub.serialNumber})`;
    }
    let result = `RevHub ${serialNumberText}: ${hub.moduleAddress}\n`;

    if (hub.isParent()) {
        result = `USB Expansion Hub: ${hub.serialNumber} ${hub.moduleAddress}\n`;
        for (const child of hub.children) {
            result += `\tUSB Expansion Hub: ${child.moduleAddress}\n`;
        }
    }

    return result;
}
