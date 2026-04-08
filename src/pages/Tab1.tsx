import React from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent
} from '@ionic/react';
import { useBle } from '../context/BleContext';
import { Mood } from '../services/BleService';

const MODULE_CONFIG: Record<string, { label: string; emoji: string; color: string; desc: string }> = {
  popit: { label: 'Pop-It Grid', emoji: '🔵', color: '#F5A623', desc: 'Pressure & tap sensing' },
  roller: { label: 'Roller Slide', emoji: '↔️', color: '#50C8E8', desc: 'Speed & direction sensing' },
  twistknob: { label: 'Twist Knob', emoji: '🔘', color: '#9B59B6', desc: 'Rotation & speed sensing' },
  texturerub: { label: 'Texture Rub', emoji: '🟫', color: '#8B6914', desc: 'Touch & pressure sensing' },
  spinner: { label: 'Spinner', emoji: '🌀', color: '#E84040', desc: 'Spin speed & duration' },
  clicker: { label: 'Clicky Keys', emoji: '⌨️', color: '#4A7C3F', desc: 'Tap count & rhythm' },
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
          <IonTitle>Emoodu</IonTitle>
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
                {connected ? 'emoodu connected' : 'Not connected (Go to Connect tab)'}
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
                    transition: 'all 0.4s ease',
                    boxShadow: !isEmpty ? `0 4px 16px ${mod!.color}44` : 'none',
                    minHeight: 160,
                    opacity: !connected ? 0.4 : 1,
                    cursor: tappable ? 'pointer' : 'default',
                  }}
                >
                  {/* Slot number */}
                  <p style={{
                    fontSize: 9, fontWeight: 700,
                    color: !isEmpty ? 'rgba(255,255,255,0.6)' : '#ccc',
                    letterSpacing: 0.8, margin: '0 0 4px',
                    textTransform: 'uppercase',
                  }}>
                    Slot {i + 1}
                  </p>

                  {isEmpty ? (
                    <>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        backgroundColor: '#f0f0f0', marginBottom: 8,
                      }} />
                      <div style={{
                        width: 60, height: 10, borderRadius: 4,
                        backgroundColor: '#f0f0f0', marginBottom: 6,
                      }} />
                      <p style={{ fontSize: 11, color: '#ccc', margin: 0 }}>
                        No module
                      </p>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 28, marginBottom: 4 }}>
                        {mod!.emoji}
                      </span>
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: 'white', marginBottom: 8,
                      }}>
                        {mod!.label}
                      </span>
                      <div style={{
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        borderRadius: 12, padding: '8px 10px', width: '100%',
                      }}>
                        <p style={{
                          fontSize: 9, color: 'rgba(255,255,255,0.7)',
                          margin: '0 0 4px', letterSpacing: 0.8,
                          textTransform: 'uppercase',
                        }}>
                          Emotion
                        </p>
                        <span style={{ fontSize: 24 }}>{mood.emoji}</span>
                        <p style={{
                          fontSize: 11, fontWeight: 700,
                          color: 'white', margin: '2px 0 0',
                        }}>
                          {mood.label}
                        </p>
                      </div>

                      {/* Tap hint */}
                      <p style={{
                        fontSize: 9, color: 'rgba(255,255,255,0.5)',
                        margin: '8px 0 0',
                      }}>
                        Tap for details →
                      </p>
                    </>
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
