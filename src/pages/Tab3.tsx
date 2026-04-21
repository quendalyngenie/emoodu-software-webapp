// src/pages/Tab3.tsx
import React from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonBadge, IonText
} from '@ionic/react';
import { useBle } from '../context/BleContext';
import { Mood } from '../services/BleService';

import djdisc from '../assets/modules/djdisc.png';
import popit from '../assets/modules/popit.png';
import wavepad from '../assets/modules/wavepad.png';
import bloombox from '../assets/modules/bloombox.png';
import pushit from '../assets/modules/pushit.png';
import tom from '../assets/modules/tom.png';

const MOOD_COLORS: Record<Mood, string> = {
  calm: '#4A90D9',
  active: '#7ED321',
  overstimulated: '#9B5DE5',
  selfregulating: '#E84040',
  unknown: '#AAAAAA',
};

const MOOD_EMOJI: Record<Mood, string> = {
  calm: '😌',
  active: '⚡',
  overstimulated: '🤯',
  selfregulating: '🔄',
  unknown: '❓',
};

const MODULE_CONFIG: Record<string, { label: string; image: string; color: string }> = {
  djdisc: { label: 'DJ Disc', image: djdisc, color: '#9B59B6' },
  popit: { label: 'Pop It', image: popit, color: '#F5A623' },
  wavepad: { label: 'Wave Pad', image: wavepad, color: '#50C8E8' },
  bloombox: { label: 'Bloom Box', image: bloombox, color: '#E84040' },
  pushit: { label: 'Push It', image: pushit, color: '#4A7C3F' },
  tom: { label: 'Tom', image: tom, color: '#8B6914' },
};

const Tab3: React.FC = () => {
  const { history } = useBle();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mood History</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>📋</p>
            <p style={{ fontSize: 15, color: 'gray' }}>No mood history yet.</p>
            <p style={{ fontSize: 13, marginTop: 6, color: '#aaa' }}>
              Connect to a device to start logging.
            </p>
          </div>
        ) : (
          <IonList>
            {history.map((entry, i) => {
              const mod = MODULE_CONFIG[entry.module];
              return (
                <IonItem key={i} style={{ '--padding-start': '16px' }}>

                  {/* Module image */}
                  <div slot="start" style={{
                    width: 44, height: 44,
                    borderRadius: 10,
                    backgroundColor: mod ? mod.color : '#eee',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, padding: 4,
                  }}>
                    {mod ? (
                      <img
                        src={mod.image}
                        alt={mod.label}
                        style={{ width: 36, height: 36, objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ fontSize: 20 }}>○</span>
                    )}
                  </div>

                  <IonLabel style={{ marginLeft: 8 }}>
                    {/* Mood + module name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 16 }}>{MOOD_EMOJI[entry.mood]}</span>
                      <span style={{ fontWeight: 600, fontSize: 14, color: '#2C2416' }}>
                        {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                      </span>
                      <IonBadge style={{
                        backgroundColor: MOOD_COLORS[entry.mood],
                        fontSize: 10, padding: '2px 8px', borderRadius: 10,
                      }}>
                        {mod ? mod.label : entry.module}
                      </IonBadge>
                    </div>

                    {/* Insight */}
                    <p style={{ fontSize: 11, color: '#888', margin: 0, lineHeight: 1.4 }}>
                      {entry.insight}
                    </p>
                  </IonLabel>

                  {/* Timestamp */}
                  <IonText slot="end" style={{ fontSize: 10, color: '#aaa', textAlign: 'right' }}>
                    <p style={{ margin: 0 }}>
                      {entry.timestamp.toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </p>
                    <p style={{ margin: 0 }}>
                      {entry.timestamp.toLocaleDateString()}
                    </p>
                  </IonText>

                </IonItem>
              );
            })}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab3;

