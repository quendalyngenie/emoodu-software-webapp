// src/pages/Tab2.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonBadge, IonSpinner, IonList, IonItem,
  IonLabel, IonText, IonBackButton, IonButtons, useIonToast
} from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import { ScanResult } from '@capacitor-community/bluetooth-le';
import { useBle } from '../context/BleContext';
import { Mood, BleService, getInsight } from '../services/BleService';

import djdisc from '../assets/modules/djdisc.png';
import popit from '../assets/modules/popit.png';
import wavepad from '../assets/modules/wavepad.png';
import bloombox from '../assets/modules/bloombox.png';
import pushit from '../assets/modules/pushit.png';
import tom from '../assets/modules/tom.png';
import george from '../assets/modules/george.png';
import mabel from '../assets/modules/mabel.png';

// Tom GIFs
import tomActive from '../assets/modules/tom-active.gif';
import tomOverstimulated from '../assets/modules/tom-overstimulated.gif';
import tomSelfregulating from '../assets/modules/tom-selfregulating.gif';

// George GIFs
import georgeActive from '../assets/modules/george-active.gif';
import georgeOverstimulated from '../assets/modules/george-overstimulated.gif';
import georgeSelfregulating from '../assets/modules/george-selfregulating.gif';

// Mabel GIFs
import mabelActive from '../assets/modules/mabel-active.gif';
import mabelOverstimulated from '../assets/modules/mabel-overstimulated.gif';
import mabelSelfregulating from '../assets/modules/mabel-selfregulating.gif';

const MOOD_CONFIG: Record<Mood, { label: string; color: string; emoji: string; description: string }> = {
  calm: { label: 'Calm', color: '#4A90D9', emoji: '😌', description: 'Child is relaxed and regulated.' },
  active: { label: 'Active', color: '#7ED321', emoji: '⚡', description: 'Child is alert and energised.' },
  overstimulated: { label: 'Overstimulated', color: '#9B5DE5', emoji: '🤯', description: 'Child is experiencing sensory overload.' },
  selfregulating: { label: 'Self Regulating', color: '#E84040', emoji: '🔄', description: 'Child is working through emotions.' },
  unknown: { label: '—', color: '#AAAAAA', emoji: '❓', description: 'No data received yet.' },
};

const MODULE_CONFIG: Record<string, { label: string; image: string; color: string; desc: string }> = {
  djdisc: { label: 'DJ Disc', image: djdisc, color: '#9B59B6', desc: 'Spin & scratch sensing' },
  popit: { label: 'Pop It', image: popit, color: '#F5A623', desc: 'Pressure & tap sensing' },
  wavepad: { label: 'Wave Pad', image: wavepad, color: '#50C8E8', desc: 'Smooth wave sensing' },
  bloombox: { label: 'Bloom Box', image: bloombox, color: '#E84040', desc: 'Squeeze & bloom sensing' },
  pushit: { label: 'Push It', image: pushit, color: '#4A7C3F', desc: 'Press & push sensing' },
  tom: { label: 'Tom', image: tom, color: '#8B6914', desc: 'Tap & drum sensing' },
  george: { label: 'George', image: george, color: '#2A5F8A', desc: 'Grip & squeeze sensing' },
  mabel: { label: 'Mabel', image: mabel, color: '#C0392B', desc: 'Twist & turn sensing' },
};

// GIFs per module per mood
const MODULE_GIFS: Partial<Record<string, Partial<Record<Mood, string>>>> = {
  tom: {
    active: tomActive,
    overstimulated: tomOverstimulated,
    selfregulating: tomSelfregulating,
  },
  george: {
    active: georgeActive,
    overstimulated: georgeOverstimulated,
    selfregulating: georgeSelfregulating,
  },
  mabel: {
    active: mabelActive,
    overstimulated: mabelOverstimulated,
    selfregulating: mabelSelfregulating,
  },
};

const IS_NATIVE = Capacitor.isNativePlatform();

const getModuleImage = (moduleKey: string, mood: Mood): string => {
  const gif = MODULE_GIFS[moduleKey]?.[mood];
  if (gif) return gif;
  return MODULE_CONFIG[moduleKey]?.image ?? '';
};

const Tab2: React.FC = () => {
  const { moduleKey } = useParams<{ moduleKey?: string }>();
  const history = useHistory();
  const {
    connected, slots, battery,
    deviceName, connect, disconnect,
  } = useBle();
  const [present] = useIonToast();
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<ScanResult[]>([]);

  const batteryColor = battery > 50 ? '#7ED321' : battery > 20 ? '#F5A623' : '#E84040';
  const targetSlot = moduleKey
    ? slots.find(s => s.module === moduleKey)
    : slots.find(s => s.module !== null);
  const moodConfig = MOOD_CONFIG[targetSlot?.mood ?? 'unknown'];
  const moduleConfig = targetSlot?.module ? MODULE_CONFIG[targetSlot.module] : null;
  const targetImage = targetSlot?.module
    ? getModuleImage(targetSlot.module, targetSlot.mood)
    : null;

  useEffect(() => {
    if (IS_NATIVE) BleService.initialize().catch(console.error);
  }, []);

  const handleConnect = async () => {
    if (!IS_NATIVE) {
      try {
        await connect('', '');
        history.push('/tab1');
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
      history.push('/tab1');
    } catch (e: any) {
      present({ message: e.message, duration: 3000, color: 'danger' });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {moduleKey && (
            <IonButtons slot="start">
              <IonBackButton defaultHref="/tab1" />
            </IonButtons>
          )}
          <IonTitle>
            {moduleKey && moduleConfig ? moduleConfig.label : 'Connect & Mood'}
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
                Device
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
                  <IonBadge color="success" style={{ fontSize: 11, marginBottom: 4 }}>Connected</IonBadge>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#2C2416' }}>{deviceName}</p>
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
                      <IonItem key={d.device.deviceId} button onClick={() => handleDeviceTap(d)}>
                        <IonLabel>
                          <h2>{d.device.name ?? 'Unknown Device'}</h2>
                          <p>{d.device.deviceId}</p>
                        </IonLabel>
                        <IonText slot="end" color="medium">RSSI {d.rssi}</IonText>
                      </IonItem>
                    ))}
                  </IonList>
                )}

                {scanning && devices.length === 0 && (
                  <p style={{ color: '#aaa', fontSize: 12, marginTop: 12 }}>
                    Looking for emoodu...
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
                  transition: 'all 0.6s ease', minHeight: 180,
                }}>
                  <p style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.7)',
                    margin: '0 0 8px', letterSpacing: 1, textTransform: 'uppercase',
                  }}>
                    Emotion
                  </p>
                  <span style={{ fontSize: 44 }}>{moodConfig.emoji}</span>
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

                {/* Fidget — GIF for tom/george/mabel */}
                <div style={{
                  flex: 1,
                  backgroundColor: moduleConfig ? moduleConfig.color : '#AAAAAA',
                  borderRadius: 20, padding: '16px 10px',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  boxShadow: moduleConfig ? `0 4px 16px ${moduleConfig.color}44` : 'none',
                  transition: 'all 0.6s ease', minHeight: 180,
                }}>
                  <p style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.7)',
                    margin: '0 0 8px', letterSpacing: 1, textTransform: 'uppercase',
                  }}>
                    Fidget
                  </p>
                  {targetImage ? (
                    <img
                      src={targetImage}
                      alt={moduleConfig?.label ?? 'module'}
                      style={{
                        width: 110, height: 110,
                        objectFit: 'contain', borderRadius: 14,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        padding: 8, marginBottom: 4,
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 44 }}>❓</span>
                  )}
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
                    {moduleConfig ? moduleConfig.desc : 'No module'}
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
                  💬 {getInsight(targetSlot.mood)}
                </div>
              )}

              {/* All slots */}
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
                      const slotImg = slot.module
                        ? getModuleImage(slot.module, slot.mood)
                        : null;
                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center',
                          gap: 12, padding: '10px 14px',
                          backgroundColor: '#f8f8f8', borderRadius: 12,
                          opacity: slot.module === null ? 0.4 : 1,
                        }}>
                          {slotImg ? (
                            <img
                              src={slotImg}
                              alt={mod?.label ?? 'module'}
                              style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 10 }}
                            />
                          ) : (
                            <span style={{ fontSize: 20 }}>○</span>
                          )}
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
