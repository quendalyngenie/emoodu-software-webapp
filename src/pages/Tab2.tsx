import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonBadge, IonSpinner, IonList,
  IonItem, IonLabel, IonText, IonBackButton,
  IonButtons, useIonToast
} from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import { ScanResult } from '@capacitor-community/bluetooth-le';
import { useBle } from '../context/BleContext';
import { Mood, BleService } from '../services/BleService';

const MOOD_CONFIG: Record<Mood, { label: string; color: string; emoji: string; description: string }> = {
  calm: { label: 'Calm', color: '#4A90D9', emoji: '😌', description: 'Child is relaxed and regulated.' },
  active: { label: 'Active', color: '#7ED321', emoji: '⚡', description: 'Child is alert and energised.' },
  overstimulated: { label: 'Overstimulated', color: '#9B5DE5', emoji: '🤯', description: 'Child is experiencing sensory overload.' },
  selfregulating: { label: 'Self Regulating', color: '#E84040', emoji: '🔄', description: 'Child is working through emotions.' },
  unknown: { label: '—', color: '#AAAAAA', emoji: '❓', description: 'No data received yet.' },
};

const MODULE_CONFIG: Record<string, { label: string; emoji: string; color: string }> = {
  popit: { label: 'Pop-It Grid', emoji: '🔵', color: '#F5A623' },
  roller: { label: 'Roller Slide', emoji: '↔️', color: '#50C8E8' },
  twistknob: { label: 'Twist Knob', emoji: '🔘', color: '#9B59B6' },
  texturerub: { label: 'Texture Rub', emoji: '🟫', color: '#8B6914' },
  spinner: { label: 'Spinner', emoji: '🌀', color: '#E84040' },
  clicker: { label: 'Clicky Keys', emoji: '⌨️', color: '#4A7C3F' },
};

const IS_NATIVE = Capacitor.isNativePlatform();

const Tab2: React.FC = () => {
  const { moduleKey } = useParams<{ moduleKey?: string }>();
  const {
    connected, slots, battery,
    deviceName, connect, disconnect,
  } = useBle();
  const [present] = useIonToast();
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<ScanResult[]>([]);

  const batteryColor = battery > 50 ? '#7ED321' : battery > 20 ? '#F5A623' : '#E84040';

  // If moduleKey in URL — show that specific slot
  // Otherwise show first active slot
  const targetSlot = moduleKey
    ? slots.find(s => s.module === moduleKey)
    : slots.find(s => s.module !== null);

  const moodConfig = MOOD_CONFIG[targetSlot?.mood ?? 'unknown'];
  const moduleConfig = targetSlot?.module ? MODULE_CONFIG[targetSlot.module] : null;

  useEffect(() => {
    if (IS_NATIVE) {
      BleService.initialize().catch(console.error);
    }
  }, []);

  const handleConnect = async () => {
    if (!IS_NATIVE) {
      try {
        await connect('', '');
      } catch (e: any) {
        present({ message: e.message, duration: 3000, color: 'danger' });
      }
      return;
    }
    setDevices([]);
    setScanning(true);
    try {
      await BleService.scan((result) => {
        setDevices(prev => {
          if (prev.find(d => d.device.deviceId === result.device.deviceId)) return prev;
          return [...prev, result];
        });
      });
      setTimeout(async () => {
        await BleService.stopScan();
        setScanning(false);
      }, 5000);
    } catch (e: any) {
      present({ message: e.message, duration: 3000, color: 'danger' });
      setScanning(false);
    }
  };

  const handleDeviceTap = async (result: ScanResult) => {
    await BleService.stopScan();
    setScanning(false);
    setDevices([]);
    try {
      await connect(result.device.deviceId, result.device.name ?? 'emoodu');
      present({ message: 'Connected!', duration: 2000, color: 'success' });
    } catch (e: any) {
      present({ message: e.message, duration: 3000, color: 'danger' });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {/* Show back button when navigated from Tab1 */}
          {moduleKey && (
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tab1" />
            </IonButtons>
          )}
          <IonTitle>
            {moduleKey && moduleConfig
              ? moduleConfig.label
              : 'Connect'
            }
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: 20 }}>

          {/* Connection card */}
          <div style={{
            backgroundColor: '#FFFFFF', border: '1px solid #E2D9C8',
            borderRadius: 16, padding: 16, marginBottom: 20,
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 12,
            }}>
              <p style={{
                fontSize: 11, fontWeight: 600, color: '#A89880',
                letterSpacing: 0.8, textTransform: 'uppercase', margin: 0,
              }}>
                Device (make sure emoodu is powered on and nearby)
              </p>
              {connected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{
                    width: 24, height: 12, border: '2px solid #ccc',
                    borderRadius: 3, position: 'relative',
                    display: 'flex', alignItems: 'center', padding: '1px 2px',
                  }}>
                    <div style={{
                      position: 'absolute', right: -4, top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3, height: 5,
                      background: '#ccc', borderRadius: '0 2px 2px 0',
                    }} />
                    <div style={{
                      height: '100%', width: `${battery}%`,
                      backgroundColor: batteryColor, borderRadius: 1,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#888' }}>{battery}%</span>
                </div>
              )}
            </div>

            {connected ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <IonBadge color="success" style={{ fontSize: 11, marginBottom: 4 }}>
                    Connected
                  </IonBadge>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#2C2416' }}>
                    {deviceName}
                  </p>
                </div>
                <IonButton size="small" color="danger" fill="outline" onClick={disconnect}>
                  Disconnect
                </IonButton>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <IonButton expand="block" onClick={handleConnect} disabled={scanning}>
                  {scanning
                    ? <><IonSpinner name="crescent" />&nbsp;Scanning...</>
                    : 'Connect to emoodu'
                  }
                </IonButton>

                {IS_NATIVE && devices.length > 0 && (
                  <IonList style={{ marginTop: 12, textAlign: 'left' }}>
                    {devices.map(d => (
                      <IonItem
                        key={d.device.deviceId}
                        button
                        onClick={() => handleDeviceTap(d)}
                      >
                        <IonLabel>
                          <h2>{d.device.name ?? 'Unknown Device'}</h2>
                          <p>{d.device.deviceId}</p>
                        </IonLabel>
                        <IonText slot="end" color="medium">
                          RSSI {d.rssi}
                        </IonText>
                      </IonItem>
                    ))}
                  </IonList>
                )}

                {scanning && devices.length === 0 && (
                  <p style={{ color: '#aaa', fontSize: 12, marginTop: 12 }}>
                    Looking for Emoodu...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Live mood */}
          {!connected ? (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <p style={{ fontSize: 48 }}>📡</p>
              <p style={{ color: '#A89880', fontSize: 14 }}>Connect to see live mood</p>
            </div>
          ) : (
            <>
              <p style={{
                fontSize: 11, fontWeight: 600, color: '#A89880',
                letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
              }}>
                {moduleKey && moduleConfig ? moduleConfig.label : 'Live Mood'}
              </p>

              {/* Two widgets */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>

                {/* Emotion */}
                <div style={{
                  flex: 1, backgroundColor: moodConfig.color,
                  borderRadius: 20, padding: '16px 10px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 4px 16px ${moodConfig.color}44`,
                  transition: 'all 0.6s ease', minHeight: 160,
                }}>
                  <p style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.7)',
                    margin: '0 0 8px', letterSpacing: 1, textTransform: 'uppercase',
                  }}>
                    Emotion
                  </p>
                  <span style={{ fontSize: 40 }}>{moodConfig.emoji}</span>
                  <span style={{
                    color: 'white', fontWeight: 700,
                    fontSize: 15, marginTop: 8, textAlign: 'center',
                  }}>
                    {moodConfig.label}
                  </span>
                  <span style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: 10, marginTop: 4, textAlign: 'center',
                  }}>
                    {moodConfig.description}
                  </span>
                </div>

                {/* Fidget */}
                <div style={{
                  flex: 1,
                  backgroundColor: moduleConfig ? moduleConfig.color : '#AAAAAA',
                  borderRadius: 20, padding: '16px 10px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: moduleConfig ? `0 4px 16px ${moduleConfig.color}44` : 'none',
                  transition: 'all 0.6s ease', minHeight: 160,
                }}>
                  <p style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.7)',
                    margin: '0 0 8px', letterSpacing: 1, textTransform: 'uppercase',
                  }}>
                    Fidget
                  </p>
                  <span style={{ fontSize: 40 }}>
                    {moduleConfig ? moduleConfig.emoji : '❓'}
                  </span>
                  <span style={{
                    color: 'white', fontWeight: 700,
                    fontSize: 15, marginTop: 8, textAlign: 'center',
                  }}>
                    {moduleConfig ? moduleConfig.label : '—'}
                  </span>
                  <span style={{
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: 10, marginTop: 4, textAlign: 'center',
                  }}>
                    {targetSlot?.module ? 'Active module' : 'No module'}
                  </span>
                </div>
              </div>

              {/* Insight */}
              {targetSlot && targetSlot.mood !== 'unknown' && (
                <div style={{
                  backgroundColor: '#f8f8f8', borderRadius: 12,
                  padding: '10px 16px', fontSize: 13,
                  color: '#444', lineHeight: 1.6, marginBottom: 16,
                  borderLeft: `4px solid ${moodConfig.color}`,
                }}>
                  💬 {targetSlot.mood === 'calm' && 'Slow, steady interaction — calm and regulated'}
                  {targetSlot.mood === 'active' && 'Moderate activity — alert and energised'}
                  {targetSlot.mood === 'overstimulated' && 'High activity detected — possibly overstimulated'}
                  {targetSlot.mood === 'selfregulating' && 'Intense interaction — child is self regulating'}
                </div>
              )}

              {/* Other slots — only show when not filtering by module */}
              {!moduleKey && (
                <>
                  <p style={{
                    fontSize: 11, fontWeight: 600, color: '#A89880',
                    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
                  }}>
                    All Slots
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {slots.map((slot, i) => {
                      const mod = slot.module ? MODULE_CONFIG[slot.module] : null;
                      const mood = MOOD_CONFIG[slot.mood] ?? MOOD_CONFIG['unknown'];
                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center',
                          gap: 12, padding: '10px 14px',
                          backgroundColor: '#f8f8f8', borderRadius: 12,
                          opacity: slot.module === null ? 0.4 : 1,
                        }}>
                          <span style={{ fontSize: 20 }}>
                            {mod ? mod.emoji : '○'}
                          </span>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#2C2416' }}>
                              {mod ? mod.label : 'Empty'}
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: '#A89880' }}>
                              Slot {i + 1}
                            </p>
                          </div>
                          {slot.module !== null && (
                            <div style={{
                              backgroundColor: mood.color,
                              padding: '3px 10px', borderRadius: 12,
                              fontSize: 11, color: 'white', fontWeight: 600,
                            }}>
                              {mood.emoji} {mood.label}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;


