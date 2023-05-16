import {Command} from "commander";
import {
    ExpansionHub,
    getConnectedExpansionHubs,
    MotorNotFullyConfiguredError,
    NackError
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
        hub.on("error", (e) => {
            console.log(`Got error:`);
            console.log(e);
        });
        console.log(await toString(hub));
    });
}

if(options.error) {
    try {
        let hubs = await getConnectedExpansionHubs();
        //Motor Mode intentionally wrong to get error
        await hubs[0].setMotorChannelMode(2, 1, false);
        await hubs[0].setMotorConstantPower(2, 0);
        await hubs[0].setMotorChannelEnable(2, true);
        console.log("Expected error, but got none")
    } catch(e: any) {
        console.log(e.message)
        console.log(e.stackTrace)
        console.log("Correctly got error.")
        console.log(`Error is:\n\t${e}`)

        console.log(`Is error a nack? ${e instanceof NackError}`);
        if(e instanceof NackError) {
            console.log(`Code is ${e.nackCode}`);
        }
        console.log(`Is error a motor command error? ${e instanceof MotorNotFullyConfiguredError}`);
    }
}

async function toString(hub: ExpansionHub): Promise<string> {
    return `RevHub: ${hub.getDestAddress()}`;
}
