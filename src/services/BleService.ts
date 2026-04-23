// src/services/BleService.ts
import { BleClient, ScanResult } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';

export const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
export const CHAR_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

export type Mood = 'calm' | 'active' | 'overstimulated' | 'selfregulating' | 'unknown';
export type ModuleType =
    'djdisc' | 'popit' | 'wavepad' | 'bloombox' |
    'pushit' | 'tom' | 'george' | 'mabel';

export interface SlotData {
    id: number;
    state: number;
    speed?: number;
}

export interface DevicePayload {
    battery: number;
    modules: SlotData[];
}

export interface SensorPayload {
    module: ModuleType;
    pressure?: number;
    tapCount?: number;
    duration?: number;
    speed?: number;
    direction?: number;
    repeats?: number;
    rotations?: number;
    stopped?: boolean;
    zone?: number;
    holdTime?: number;
}

export function getInsight(mood: Mood): string {
    const map: Record<Mood, string> = {
        calm: 'Slow, steady interaction — calm and regulated',
        active: 'Moderate activity — alert and energised',
        overstimulated: 'High activity detected — possibly overstimulated',
        selfregulating: 'Intense interaction — child is self regulating',
        unknown: 'No data received yet',
    };
    return map[mood];
}

export function moodFromCode(code: number): Mood {
    switch (code) {
        case 0: return 'calm';
        case 1: return 'selfregulating';
        case 2: return 'active';
        case 3: return 'overstimulated';
        default: return 'unknown';
    }
}

export function moduleFromCode(code: number): ModuleType | null {
    switch (code) {
        case 1: return 'djdisc';
        case 2: return 'popit';
        case 3: return 'wavepad';
        case 4: return 'bloombox';
        case 5: return 'pushit';
        case 6: return 'tom';
        case 7: return 'george';
        case 8: return 'mabel';
        default: return null; // 0 = empty
    }
}

export function parseDevicePayload(raw: DataView): DevicePayload | null {
    try {
        const str = new TextDecoder().decode(raw.buffer);
        console.log('Received from ESP32:', str);
        return JSON.parse(str) as DevicePayload;
    } catch {
        return null;
    }
}

let webDevice: any = null;
let webChar: any = null;

export const BleService = {

    async initialize() {
        if (Capacitor.isNativePlatform()) {
            await BleClient.initialize({ androidNeverForLocation: true });
        }
    },

    async scan(onResult: (r: ScanResult) => void) {
        if (Capacitor.isNativePlatform()) {
            await BleClient.requestLEScan({ services: [SERVICE_UUID] }, onResult);
        }
    },

    async stopScan() {
        if (Capacitor.isNativePlatform()) {
            await BleClient.stopLEScan();
        }
    },

    async connect(
        deviceId: string,
        onDisconnect?: () => void,
        onData?: (payload: DevicePayload) => void
    ): Promise<any> {
        if (Capacitor.isNativePlatform()) {
            await BleClient.connect(deviceId, onDisconnect);
            return { id: deviceId, name: deviceId };
        } else {
            const device = await (navigator as any).bluetooth.requestDevice({
                filters: [{ services: [SERVICE_UUID] }],
            });
            webDevice = device;
            device.addEventListener('gattserverdisconnected', () => onDisconnect?.());
            const server = await device.gatt.connect();
            const service = await server.getPrimaryService(SERVICE_UUID);
            webChar = await service.getCharacteristic(CHAR_UUID);
            await webChar.startNotifications();
            webChar.addEventListener('characteristicvaluechanged', (e: any) => {
                const result = parseDevicePayload(e.target.value as DataView);
                if (result) onData?.(result);
            });
            return device;
        }
    },

    async disconnect(deviceId: string) {
        if (Capacitor.isNativePlatform()) {
            await BleClient.disconnect(deviceId);
        } else {
            if (webChar) await webChar.stopNotifications();
            if (webDevice?.gatt?.connected) webDevice.gatt.disconnect();
            webDevice = null;
            webChar = null;
        }
    },

    async startNotify(deviceId: string, onData: (payload: DevicePayload) => void) {
        if (Capacitor.isNativePlatform()) {
            await BleClient.startNotifications(deviceId, SERVICE_UUID, CHAR_UUID, (raw) => {
                const result = parseDevicePayload(raw);
                if (result) onData(result);
            });
        }
    },

    async stopNotify(deviceId: string) {
        if (Capacitor.isNativePlatform()) {
            await BleClient.stopNotifications(deviceId, SERVICE_UUID, CHAR_UUID);
        } else {
            if (webChar) await webChar.stopNotifications();
        }
    },
};
