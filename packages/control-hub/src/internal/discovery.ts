import { ControlHub } from "./ControlHub";

export async function getConnectedControlHub(): Promise<
  ControlHub | undefined
> {
  try {
    return await createControlHub();
  } catch (e: any) {
    return undefined;
  }
}

async function createControlHub(): Promise<ControlHub> {
  let hub = new ControlHub();

  if(!await hub.isConnected()) {
    throw new Error("Hub is not connected via WiFi");
  }

  await hub.open();

  return hub;
}
