import { RevHub } from "@rev-robotics/expansion-hub";

export function hubHierarchyToString(hub: RevHub): string {
    let result = "";

    if (hub.isParent()) {
        result = `USB Expansion Hub: ${hub.serialNumber} ${hub.moduleAddress}\n`;
        for (const child of hub.children) {
            result += `\tUSB Expansion Hub: ${child.moduleAddress}\n`;
        }
    }

    return result;
}
