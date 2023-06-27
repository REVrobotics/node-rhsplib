import { DebugGroup, VerbosityLevel } from "@rev-robotics/rhsplib";
import { ExpansionHub } from "@rev-robotics/rev-hub-core";

export async function injectLog(hub: ExpansionHub, hint: string) {
    await hub.injectDataLogHint(hint);
}

export async function setDebugLogLevel(hub: ExpansionHub, group: string, level: number) {
    const debugGroups = Object.keys(DebugGroup)
        .filter((key) => isNaN(Number(key)))
        .reduce((acc: Record<string, DebugGroup>, key: string) => {
            acc[key.toLowerCase()] = DebugGroup[key as keyof typeof DebugGroup];
            return acc;
        }, {});

    const lowercaseValue = group.toLowerCase();

    let debugGroup = debugGroups[lowercaseValue];

    let levels = [
        VerbosityLevel.Off,
        VerbosityLevel.Level1,
        VerbosityLevel.Level2,
        VerbosityLevel.Level3,
    ];
    let verbosity = levels[level];

    await hub.setDebugLogLevel(debugGroup.valueOf(), verbosity);
}
