import { ControlHub } from "./internal/ControlHub";

export async function openConnectedControlHub(): Promise<
  ControlHub | undefined
> {
  try {
    return await createControlHub();
  } catch (e: any) {
    console.log(e);
    return undefined;
  }
}

async function createControlHub(): Promise<ControlHub> {
  let hub = new ControlHub();

  if(!await hub.isConnected()) {
    console.log("Hub not connected")
    throw new Error("Hub is not connected via WiFi");
  }

  await hub.open();

  return hub;
}
