export interface RcInfo {
    deviceName: string;
    networkName: string;
    passphrase: string;
    serverUrl: string;
    serverIsAlive: boolean;
    isREVControlHub: boolean;
    supports5GhzAp: boolean;
    appUpdateRequiresReboot: boolean;
    supportsOtaUpdate: boolean;
    availableChannels: ApChannel[];
    currentChannel: ApChannel;
    webSocketApiVersion: number;
    sdkVersion: string;
    rcVersion: string;
    serialNumber: string;
    chOsVersion: string;
    revHubNamesAndVersions: any; // Do not use, this only contains information on _configured_ hubs
    includedFirmwareFileVersion: string;
    ftcUserAgentCategory: "DRIVER_STATION" | "ROBOT_CONTROLLER" | "OTHER";
}

export interface ApChannel {
    band: "BAND_2_4_GHZ" | "BAND_5_GHZ";
    displayName: string;
    name: string;
    overlapsWithOtherChannels: false;
}
