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
  await hub.open();

  return hub;
}
