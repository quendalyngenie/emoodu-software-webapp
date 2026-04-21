// src/pages/Tab1.tsx
import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent
} from '@ionic/react';
import { useBle } from '../context/BleContext';
import { Mood } from '../services/BleService';

import djdisc from '../assets/modules/djdisc.png';
import popit from '../assets/modules/popit.png';
import wavepad from '../assets/modules/wavepad.png';
import bloombox from '../assets/modules/bloombox.png';
import pushit from '../assets/modules/pushit.png';
import tom from '../assets/modules/tom.png';

const MODULE_CONFIG: Record<string, { label: string; image: string; color: string; desc: string }> = {
  djdisc: { label: 'DJ Disc', image: djdisc, color: '#9B59B6', desc: 'Spin & scratch sensing' },
  popit: { label: 'Pop It', image: popit, color: '#F5A623', desc: 'Pressure & tap sensing' },
  wavepad: { label: 'Wave Pad', image: wavepad, color: '#50C8E8', desc: 'Smooth wave sensing' },
  bloombox: { label: 'Bloom Box', image: bloombox, color: '#E84040', desc: 'Squeeze & bloom sensing' },
  pushit: { label: 'Push It', image: pushit, color: '#4A7C3F', desc: 'Press & push sensing' },
  tom: { label: 'Tom', image: tom, color: '#8B6914', desc: 'Tap & drum sensing' },
};

const MOOD_CONFIG: Record<Mood, { label: string; emoji: string }> = {
  calm: { label: 'Calm', emoji: '😌' },
  active: { label: 'Active', emoji: '⚡' },
  overstimulated: { label: 'Overstimulated', emoji: '🤯' },
  selfregulating: { label: 'Self Regulating', emoji: '🔄' },
  unknown: { label: '—', emoji: '❓' },
};

const Tab1: React.FC = () => {
  const { connected, slots, battery } = useBle();
  const history = useHistory();
  const batteryColor = battery > 50 ? '#7ED321' : battery > 20 ? '#F5A623' : '#E84040';

  const handleCardTap = (moduleKey: string | null) => {
    if (!connected || moduleKey === null) return;
    history.push(`/tab2/${moduleKey}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>emoodu</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: 16 }}>

          {/* Connection status + battery */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20, padding: '10px 14px',
            backgroundColor: connected ? '#EAF2E8' : '#f5f5f5',
            borderRadius: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                backgroundColor: connected ? '#4A7C3F' : '#ccc',
              }} />
              <span style={{
                fontSize: 13, fontWeight: 600,
                color: connected ? '#4A7C3F' : '#aaa',
              }}>
                {connected ? 'emoodu connected' : 'Not connected — go to Connect tab'}
              </span>
            </div>
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

          {/* Section label */}
          <p style={{
            fontSize: 11, fontWeight: 600, color: '#A89880',
            letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
          }}>
            Active Modules
          </p>

          {/* 2x2 grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 12, width: '100%',
          }}>
            {slots.map((slot, i) => {
              const isEmpty = !connected || slot.module === null;
              const mod = slot.module ? MODULE_CONFIG[slot.module] : null;
              const mood = MOOD_CONFIG[slot.mood] ?? MOOD_CONFIG['unknown'];
              const tappable = connected && slot.module !== null;

              return (
                <div
                  key={i}
                  onClick={() => handleCardTap(slot.module)}
                  style={{
                    backgroundColor: !isEmpty ? mod!.color : '#FFFFFF',
                    border: `1.5px solid ${!isEmpty ? mod!.color : '#E2D9C8'}`,
                    borderRadius: 16, padding: '16px 12px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', textAlign: 'center',
                    transition: 'background-color 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
                    boxShadow: !isEmpty ? `0 4px 16px ${mod!.color}44` : 'none',
                    height: 280,
                    width: '100%',
                    opacity: !connected ? 0.4 : 1,
                    cursor: tappable ? 'pointer' : 'default',
                    overflow: 'hidden',
                  }}
                >
                  {/* Slot number */}
                  <p style={{
                    fontSize: 9, fontWeight: 700,
                    color: !isEmpty ? 'rgba(255,255,255,0.6)' : '#ccc',
                    letterSpacing: 0.8, margin: '0 0 8px',
                    textTransform: 'uppercase',
                    height: 14, flexShrink: 0,
                  }}>
                    Slot {i + 1}
                  </p>

                  {/* Fixed image area */}
                  <div style={{
                    width: 100, height: 100,
                    flexShrink: 0, marginBottom: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 12,
                    backgroundColor: !isEmpty ? 'rgba(255,255,255,0.2)' : '#f0f0f0',
                  }}>
                    {!isEmpty && mod ? (
                      <img
                        src={mod.image}
                        alt={mod.label}
                        style={{
                          width: 88, height: 88,
                          objectFit: 'contain',
                          borderRadius: 10,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: 88, height: 88,
                        borderRadius: 10,
                        backgroundColor: '#e8e8e8',
                      }} />
                    )}
                  </div>

                  {/* Fixed label area */}
                  <div style={{ height: 18, flexShrink: 0, marginBottom: 6 }}>
                    {!isEmpty ? (
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>
                        {mod!.label}
                      </span>
                    ) : (
                      <div style={{
                        width: 60, height: 10, borderRadius: 4,
                        backgroundColor: '#f0f0f0', margin: '0 auto',
                      }} />
                    )}
                  </div>

                  {/* Fixed emotion area */}
                  <div style={{
                    width: '100%', flexShrink: 0,
                    backgroundColor: !isEmpty ? 'rgba(255,255,255,0.2)' : '#f5f5f5',
                    borderRadius: 10, padding: '6px 8px',
                    minHeight: 52,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {!isEmpty ? (
                      <>
                        <p style={{
                          fontSize: 9, color: 'rgba(255,255,255,0.7)',
                          margin: '0 0 2px', letterSpacing: 0.8,
                          textTransform: 'uppercase',
                        }}>
                          Emotion
                        </p>
                        <span style={{ fontSize: 20 }}>{mood.emoji}</span>
                        <p style={{
                          fontSize: 10, fontWeight: 700,
                          color: 'white', margin: '1px 0 0',
                        }}>
                          {mood.label}
                        </p>
                      </>

                    ) : (
                      <p style={{ fontSize: 11, color: '#ccc', margin: 0 }}>
                        No module
                      </p>
                    )}
                  </div>

                  {/* Tap hint */}
                  {!isEmpty && (
                    <p style={{
                      fontSize: 9, color: 'rgba(255,255,255,0.5)',
                      margin: '6px 0 0', flexShrink: 0,
                    }}>
                      Tap for details →
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <p style={{
            fontSize: 11, color: '#A89880',
            textAlign: 'center', marginTop: 20, lineHeight: 1.5,
          }}>
            Physically swap modules · 6 available
          </p>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Tab1;

