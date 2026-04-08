// src/context/BleContext.tsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import {
    BleService, Mood, ModuleType, DevicePayload,
    moodFromCode, moduleFromCode, getInsight,
} from '../services/BleService';
import { useEffect } from 'react'; // add to imports above
export interface SlotEntry {
    moduleId: number;
    module: ModuleType | null;
    mood: Mood;
}

export interface MoodEntry {
    mood: Mood;
    module: ModuleType;
    insight: string;
    timestamp: Date;
}

interface BleContextType {
    connected: boolean;
    deviceId: string | null;
    deviceName: string | null;
    slots: SlotEntry[];
    battery: number;
    history: MoodEntry[];
    connect: (deviceId: string, name: string) => Promise<void>;
    disconnect: () => Promise<void>;
}

const EMPTY_SLOTS: SlotEntry[] = [
    { moduleId: 0, module: null, mood: 'unknown' },
    { moduleId: 0, module: null, mood: 'unknown' },
    { moduleId: 0, module: null, mood: 'unknown' },
    { moduleId: 0, module: null, mood: 'unknown' },
];

const BleContext = createContext<BleContextType | null>(null);

export const BleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [connected, setConnected] = useState(false);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [deviceName, setDeviceName] = useState<string | null>(null);
    const [slots, setSlots] = useState<SlotEntry[]>(EMPTY_SLOTS);
    const [battery, setBattery] = useState<number>(0);
    const [history, setHistory] = useState<MoodEntry[]>([]);
    const deviceIdRef = useRef<string | null>(null);

    // ── TEST SIMULATION (uncomment to enable browser testing) ──
    //

    // useEffect(() => {
    //     if (Capacitor.isNativePlatform()) return;

    //     const testPayloads: DevicePayload[] = [
    //         { battery: 80, modules: [{ id: 1, state: 0 }, { id: 2, state: 1 }, { id: 3, state: 0 }, { id: 0, state: 0 }] },
    //         { battery: 79, modules: [{ id: 1, state: 1 }, { id: 2, state: 2 }, { id: 3, state: 0 }, { id: 0, state: 0 }] },
    //         { battery: 78, modules: [{ id: 1, state: 0 }, { id: 2, state: 3 }, { id: 3, state: 1 }, { id: 4, state: 0 }] },
    //         { battery: 77, modules: [{ id: 1, state: 2 }, { id: 2, state: 0 }, { id: 3, state: 0 }, { id: 4, state: 1 }] },
    //         { battery: 76, modules: [{ id: 1, state: 0 }, { id: 2, state: 1 }, { id: 0, state: 0 }, { id: 0, state: 0 }] },
    //         { battery: 75, modules: [{ id: 1, state: 3 }, { id: 2, state: 0 }, { id: 5, state: 1 }, { id: 6, state: 2 }] },
    //     ];

    //     // Module IDs: 0=empty, 1=twistknob, 2=roller, 3=popit, 4=texturerub, 5=spinner, 6=clicker
    //     // Mood codes: 0=calm, 1=active, 2=overstimulated, 3=selfregulating

    //     let idx = 0;
    //     setConnected(true);
    //     setDeviceName('emoodu (test)');
    //     processPayload(testPayloads[0]);

    //     const interval = setInterval(() => {
    //         idx = (idx + 1) % testPayloads.length;
    //         processPayload(testPayloads[idx]);
    //     }, 3000);

    //     return () => clearInterval(interval);
    // }, []);

    // ── END TEST SIMULATION ─────────────────────────────────────

    // ── Process incoming payload ─────────────────────────────
    const processPayload = useCallback((payload: DevicePayload) => {
        setBattery(payload.battery);

        const newSlots: SlotEntry[] = payload.modules.map(s => ({
            moduleId: s.id,
            module: moduleFromCode(s.id),
            mood: s.id === 0 ? 'unknown' : moodFromCode(s.state),
        }));

        setSlots(newSlots);

        newSlots.forEach(slot => {
            if (slot.module !== null && slot.mood !== 'unknown') {
                setHistory(prev => [{
                    mood: slot.mood,
                    module: slot.module!,
                    insight: getInsight(slot.mood),
                    timestamp: new Date(),
                }, ...prev].slice(0, 200));
            }
        });
    }, []);

    // ── Connect ──────────────────────────────────────────────
    const connect = useCallback(async (id: string, name: string) => {
        const onDisconnect = () => {
            setConnected(false);
            setSlots(EMPTY_SLOTS);
            setBattery(0);
            deviceIdRef.current = null;
        };

        if (Capacitor.isNativePlatform()) {
            await BleService.connect(id, onDisconnect);

            // Native — inline handler to avoid stale closure
            await BleService.startNotify(id, (payload: DevicePayload) => {
                setBattery(payload.battery);

                const newSlots: SlotEntry[] = payload.modules.map(s => ({
                    moduleId: s.id,
                    module: moduleFromCode(s.id),
                    mood: s.id === 0 ? 'unknown' : moodFromCode(s.state),
                }));

                setSlots(newSlots);

                newSlots.forEach(slot => {
                    if (slot.module !== null && slot.mood !== 'unknown') {
                        setHistory(prev => [{
                            mood: slot.mood,
                            module: slot.module!,
                            insight: getInsight(slot.mood),
                            timestamp: new Date(),
                        }, ...prev].slice(0, 200));
                    }
                });
            });

            deviceIdRef.current = id;
            setDeviceId(id);
            setDeviceName(name);

        } else {
            // Web Bluetooth
            const device = await BleService.connect(id, onDisconnect, processPayload);
            deviceIdRef.current = device.id ?? id;
            setDeviceId(device.id ?? id);
            setDeviceName(device.name ?? 'emoodu');
        }

        setConnected(true);
    }, [processPayload]);

    // ── Disconnect ───────────────────────────────────────────
    const disconnect = useCallback(async () => {
        if (deviceIdRef.current) {
            await BleService.stopNotify(deviceIdRef.current);
            await BleService.disconnect(deviceIdRef.current);
        }
        setConnected(false);
        setDeviceId(null);
        setDeviceName(null);
        setSlots(EMPTY_SLOTS);
        setBattery(0);
        deviceIdRef.current = null;
    }, []);

    return (
        <BleContext.Provider value={{
            connected, deviceId, deviceName,
            slots, battery, history,
            connect, disconnect,
        }}>
            {children}
        </BleContext.Provider>
    );
};

export const useBle = () => {
    const ctx = useContext(BleContext);
    if (!ctx) throw new Error('useBle must be used inside BleProvider');
    return ctx;
};

