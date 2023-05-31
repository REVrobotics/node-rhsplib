import { Command } from "commander";
import { list } from "./command/list.js";
import { led } from "./command/led.js";
import {
    ExpansionHub,
    openConnectedExpansionHubs,
    openHubWithAddress,
    openParentExpansionHub,
} from "@rev-robotics/expansion-hub";

const program = new Command();

program.version("1.0.0");

program
    .option("-s --serial <serial>", "serial number")
    .option("-a --address <address>", "module address");

program
    .command("list")
    .description("List all connected expansion hubs")
    .action(async () => {
        let hubs = await getExpansionHubs();
        await list(hubs);
    });

program
    .command("led")
    .description("Run LED steps")
    .action(async () => {
        let hubs = await getExpansionHubs();
        await led(hubs);
    });

program.parse(process.argv);

async function getExpansionHubs(): Promise<ExpansionHub[]> {
    let options = program.opts();
    let serialNumber = options.serial;
    let moduleAddress = options.address ? Number(options.address) : undefined;
    if (serialNumber) {
        let parentHub = await openParentExpansionHub(serialNumber, moduleAddress);
        if (!moduleAddress || moduleAddress == parentHub.moduleAddress) {
            return [parentHub];
        } else {
            let childHub = await parentHub.addChildByAddress(moduleAddress);
            if (childHub.isExpansionHub()) {
                return [childHub];
            }
        }
    } else if (moduleAddress) {
        //module address specified, but no serial number
        let hub = await openHubWithAddress(moduleAddress, moduleAddress);
        if (hub.isExpansionHub()) {
            return [hub];
        } else {
            program.error(`No expansion hub found with module address ${moduleAddress}`);
        }
    }

    return await openConnectedExpansionHubs();
}
