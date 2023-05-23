# Specification for an FTC WebSocket namespace to control hardware connected to Control Hubs

## Implementation Note

We don't want to fight with a user Op Mode over control of the hardware; that would be a recipe for trouble. Instead, my idea is to work within the Op Mode system. I would add a built-in, hidden Manual Control Op Mode (MCOM) that would provide hardware access to the WebSocket API. Using the API would auto-start the MCOM, and the user could go back to normal operation by stopping the MCOM from the Driver Station, like any other Op Mode. If a different Op Mode is already running, an error will be reported via the manual control API, and the original Op Mode will keep running.

## Details

1. **Command: Get connected USB devices**

   Sending this command starts the MCOM, which does a USB scan, so that all connected REV modules can be controlled, even if they aren't included in the current configuration file. The response also includes modules that are configured, but not currently attached. The attachment and configuration state of each device is specified in the response. The response also includes an API version number.

3. **Notification: MCOM stopped**

   The API client needs to know when the MCOM is stopped, and it has lost control of the hardware. It can recover from this by sending the command to get connected devices again.

4. **Command: Stop MCOM**

   The API client needs the ability to specify when it is done performing manual control.

5. **Command: Discover child modules**

	Performs Discovery for all specified serial numbers

6. **Command: Start sending IMU data**
	
	Starts sending the IMU data notification at a specified frequency. Returns an error if the device is not a Control Hub.

7. **Notification: IMU data**
	Contains the latest IMU data from the Control Hub

There will be additional commands for the various things that an Expansion/Control Hub can do, which typically map to the different RHSP commands.
