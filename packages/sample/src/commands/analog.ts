import { getConnectedExpansionHubs } from "@rev-robotics/expansion-hub";

export async function analog(channel: number, continuous: boolean) {
  const hubs = await getConnectedExpansionHubs();

  if (continuous) {
    while (true) {
      let value = await hubs[0].getADC(channel, false);
      console.log(`ADC: ${value} mV`);
    }
  } else {
    let value = await hubs[0].getADC(channel, false);
    console.log(`ADC: ${value} mV`);
    hubs.forEach((hub) => {
      hub.close();
    });
  }
}

export async function temperature(continuous: boolean) {
  const hubs = await getConnectedExpansionHubs();

  if (continuous) {
    while (true) {
      let value = await hubs[0].getTemperature();
      console.log(`Temperature: ${value} C`);
    }
  } else {
    let value = await hubs[0].getTemperature();
    console.log(`Temperature: ${value} C`);
    hubs.forEach((hub) => {
      hub.close();
    });
  }
}

export async function battery(continuous: boolean) {
  const hubs = await getConnectedExpansionHubs();

  if (continuous) {
    while (true) {
      let value = await hubs[0].getBatteryVoltage();
      console.log(`Battery: ${value} mV`);
    }
  } else {
    let value = await hubs[0].getBatteryVoltage();
    console.log(`Battery: ${value} mV`);
    hubs.forEach((hub) => {
      hub.close();
    });
  }
}

export async function voltageRail(continuous: boolean) {
  const hubs = await getConnectedExpansionHubs();

  if (continuous) {
    while (true) {
      let value = await hubs[0].get5VMonitorVoltage();
      console.log(`5V rail: ${value} mV`);
    }
  } else {
    let value = await hubs[0].get5VMonitorVoltage();
    console.log(`5V rail: ${value} mV`);
    hubs.forEach((hub) => {
      hub.close();
    });
  }
}
