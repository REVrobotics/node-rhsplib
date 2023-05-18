import {Command} from "commander";
import {
    ExpansionHub,
    getConnectedExpansionHubs, getPossibleExpansionHubSerialNumbers,
    MotorNotFullyConfiguredError,
    NackError, openParentExpansionHub,
    RevHub
} from "@rev-robotics/expansion-hub";

const program = new Command();

program.version('1.0.0')
    .option('-l --list', 'List connected devices')
    .option('-e --error', 'error out')
    .parse(process.argv);

const options = program.opts();

console.log("Starting...");

if(options.list) {
    console.log("Starting to search Serial Ports")
    const hubs: ExpansionHub[] = await getConnectedExpansionHubs();
    hubs.forEach(async (hub) => {
        hub.on("error", (e: any) => {
            console.log(`Got error:`);
            console.log(e);
        });
        console.log(await toString(hub));
    });

    setTimeout(() => {
        hubs.forEach(async (hub) => {
            hub.close();
        })
    }, 2000);
}

if(options.error) {
    let hubs = await getConnectedExpansionHubs();
    try {
        //Motor Mode intentionally wrong to get error
        await hubs[0].setMotorChannelMode(2, 1, false);
        await hubs[0].setMotorConstantPower(2, 0);
        await hubs[0].setMotorChannelEnable(2, true);
        console.log("Expected error, but got none")
    } catch(e: any) {
        console.log(e.message);
        console.log(`Error is:\n\t${e}`);

        console.log(`Is error a nack? ${e instanceof NackError}`);
        if(e instanceof NackError) {
            console.log(`Code is ${e.nackCode}`);
        }
        console.log(`Is error a motor command error? ${e instanceof MotorNotFullyConfiguredError}`);
    }

    hubs[0].close();

    try {
        let serialNumbers = await getPossibleExpansionHubSerialNumbers();
        await openParentExpansionHub(serialNumbers[0], 12);
        console.log("Did not get error opening hub ith wrong address");
    } catch(e) {
        console.log("Got error opening parent hub with invalid address");
        console.log(e);
    }

    try {
        let hubs = await getConnectedExpansionHubs();
        if(hubs[0].isParent()) {
            await hubs[0].addChildByAddress(15);
        }
        hubs[0].close();
    } catch(e: any) {
        console.log("Got error opening child hub with invalid address");
        console.log(e);
    }
}

async function toString(hub: RevHub): Promise<string> {
    let result = `RevHub: ${hub.moduleAddress}\n`;

    if(hub.isExpansionHub()) {
        console.log(`Is open? ${hub.isOpen}`)
    }

    if(hub.isParent()) {
        for(const child of hub.children) {
            result += `\tRevHub: ${child.moduleAddress}\n`;
        }
    }

    return result;
}
