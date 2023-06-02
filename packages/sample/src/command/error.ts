import {
    getPossibleExpansionHubSerialNumbers,
    MotorNotFullyConfiguredError,
    NackError,
    openConnectedExpansionHubs,
    openParentExpansionHub,
} from "@rev-robotics/expansion-hub";

export async function error() {
    let hubs = await openConnectedExpansionHubs();
    try {
        //Motor Mode intentionally wrong to get error
        await hubs[0].setMotorChannelMode(2, 1, false);
        await hubs[0].setMotorConstantPower(2, 0);
        await hubs[0].setMotorChannelEnable(2, true);
        console.log("Expected error, but got none");
    } catch (e: any) {
        console.log(e.message);
        console.log(`Error is:\n\t${e}`);

        console.log(`Is error a nack? ${e instanceof NackError}`);
        if (e instanceof NackError) {
            console.log(`Code is ${e.nackCode}`);
        }
        console.log(
            `Is error a motor command error? ${
                e instanceof MotorNotFullyConfiguredError
            }`,
        );
    }

    hubs[0].close();

    try {
        let serialNumbers = await getPossibleExpansionHubSerialNumbers();
        await openParentExpansionHub(serialNumbers[0], 80);
        console.log("Did not get error opening hub with wrong address");
    } catch (e) {
        console.log("Got error opening parent hub with invalid address");
        console.log(e);
    }

    try {
        let hubs = await openConnectedExpansionHubs();
        if (hubs[0].isParent()) {
            await hubs[0].addChildByAddress(95);
        }
    } catch (e: any) {
        console.log("Got error opening child hub with invalid address");
        console.log(e);
    }
    hubs[0].close();
}
