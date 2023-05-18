import {Command} from "commander";
import {ExpansionHub, getConnectedExpansionHubs} from "@rev-robotics/expansion-hub";
import {RevHub} from "@rev-robotics/expansion-hub";
import {DistanceSensor} from "@rev-robotics/distance-sensor";

const program = new Command();

program.version('1.0.0')
    .option('-l --list', 'List connected devices')
    .option('-d --distance <channel>', 'Print distance sensor output')
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
}

if(options.distance) {
    let channel = Number(options.distance)
    console.log(`Channel number is ${channel}`);

    let hubs = await getConnectedExpansionHubs();
    let hub = hubs[0];

    let sensor = new DistanceSensor(hub, channel);

    console.log("Checking sensor type");

    if(!(await sensor.is2mDistanceSensor())) {
        console.log("Sensor is not a valid distance sensor!");
    }

    console.log("Initializing sensor");

    await sensor.initialize();

    let timer = setInterval(async () => {
        let distance = await sensor.getDistanceMillimeters();

        console.log(`Distance is ${distance}mm`);
    }, 1000);

    setTimeout(async () => {
        clearInterval(timer);
        hub.close();
    }, 20000);
}

async function toString(hub: RevHub): Promise<string> {
    let result = `RevHub: ${hub.moduleAddress}\n`;

    if(hub.isParent()) {
        for(const child of hub.getChildren()) {
            result += `\tRevHub: ${child.moduleAddress}\n`;
        }
    }

    return result;
}
