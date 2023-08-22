import { ControlHub, RevHub } from "@rev-robotics/rev-hub-core";

export function controlHubHierarchyToString(hub: ControlHub): string {
    let result = `Control Hub: ${hub.serialNumber} ${hub.moduleAddress}\n`;
    for (const child of hub.children) {
        if (child.isParent()) {
            result += `\tUSB Hub: ${child.serialNumber} ${child.moduleAddress}\n`;

            for (const grandchild of child.children) {
                result += `\t\tRS-485 Hub: ${grandchild.moduleAddress}\n`;
            }
        } else {
            result += `\tRS-485 Hub: ${child.moduleAddress}\n`;
        }
    }

    return result;
}

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
