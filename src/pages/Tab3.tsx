// // src/pages/Tab3.tsx
// import React from 'react';
// import {
//   IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
//   IonList, IonItem, IonLabel, IonBadge, IonText
// } from '@ionic/react';
// import { useBle } from '../context/BleContext';
// import { Mood } from '../services/BleService';

// const MOOD_COLORS: Record<Mood, string> = {
//   calm: '#4A90D9',
//   active: '#7ED321',
//   overstimulated: '#9B5DE5',
//   selfregulating: '#E84040',
//   unknown: '#AAAAAA',
// };

// const MOOD_EMOJI: Record<Mood, string> = {
//   calm: '😌',
//   active: '⚡',
//   overstimulated: '🤯',
//   selfregulating: '🔄',
//   unknown: '❓',
// };

// const MODULE_LABELS: Record<string, string> = {
//   popit: 'Pop-It Grid',
//   roller: 'Roller Slide',
//   twistknob: 'Twist Knob',
//   texturerub: 'Texture Rub',
// };

// const Tab3: React.FC = () => {
//   const { history } = useBle();

//   return (
//     <IonPage>
//       <IonHeader>
//         <IonToolbar>
//           <IonTitle>Mood History</IonTitle>
//         </IonToolbar>
//       </IonHeader>
//       <IonContent>
//         {history.length === 0 ? (
//           <div style={{ textAlign: 'center', marginTop: 80, color: 'gray' }}>
//             <p style={{ fontSize: 32, marginBottom: 12 }}>📋</p>
//             <p style={{ fontSize: 15 }}>No mood history yet.</p>
//             <p style={{ fontSize: 13, marginTop: 6, color: '#aaa' }}>
//               Connect to a device to start logging.
//             </p>
//           </div>
//         ) : (
//           <IonList>
//             {history.map((entry, i) => (
//               <IonItem key={i} style={{ '--padding-start': '16px' }}>

//                 <div slot="start" style={{
//                   width: 10, height: 10, borderRadius: '50%',
//                   backgroundColor: MOOD_COLORS[entry.mood],
//                   marginRight: 12, flexShrink: 0,
//                 }} />

//                 <IonLabel>
//                   <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
//                     <span style={{ fontSize: 16 }}>{MOOD_EMOJI[entry.mood]}</span>
//                     <span style={{ fontWeight: 600, fontSize: 15 }}>
//                       {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
//                     </span>
//                     <IonBadge style={{
//                       backgroundColor: MOOD_COLORS[entry.mood],
//                       fontSize: 10, padding: '2px 8px', borderRadius: 10,
//                     }}>
//                       {MODULE_LABELS[entry.module] ?? entry.module}
//                     </IonBadge>
//                   </div>
//                   <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{entry.insight}</p>
//                 </IonLabel>

//                 <IonText slot="end" style={{ fontSize: 11, color: '#aaa', textAlign: 'right' }}>
//                   <p style={{ margin: 0 }}>
//                     {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
//                   </p>
//                   <p style={{ margin: 0 }}>
//                     {entry.timestamp.toLocaleDateString()}
//                   </p>
//                 </IonText>

//               </IonItem>
//             ))}
//           </IonList>
//         )}
//       </IonContent>
//     </IonPage>
//   );
// };

// export default Tab3;
// src/pages/Tab3.tsx
import React from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonLabel, IonBadge, IonText
} from '@ionic/react';
import { useBle } from '../context/BleContext';
import { Mood } from '../services/BleService';

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

const MODULE_LABELS: Record<string, string> = {
  popit: 'Pop-It Grid',
  roller: 'Roller Slide',
  twistknob: 'Twist Knob',
  texturerub: 'Texture Rub',
  spinner: 'Spinner',
  clicker: 'Clicky Keys',
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
          <div style={{ textAlign: 'center', marginTop: 80, color: 'gray' }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>📋</p>
            <p style={{ fontSize: 15 }}>No mood history yet.</p>
            <p style={{ fontSize: 13, marginTop: 6, color: '#aaa' }}>
              Connect to a device to start logging.
            </p>
          </div>
        ) : (
          <IonList>
            {history.map((entry, i) => (
              <IonItem key={i} style={{ '--padding-start': '16px' }}>
                <div slot="start" style={{
                  width: 10, height: 10, borderRadius: '50%',
                  backgroundColor: MOOD_COLORS[entry.mood],
                  marginRight: 12, flexShrink: 0,
                }} />
                <IonLabel>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 16 }}>{MOOD_EMOJI[entry.mood]}</span>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>
                      {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                    </span>
                    <IonBadge style={{
                      backgroundColor: MOOD_COLORS[entry.mood],
                      fontSize: 10, padding: '2px 8px', borderRadius: 10,
                    }}>
                      {MODULE_LABELS[entry.module] ?? entry.module}
                    </IonBadge>
                  </div>
                  <p style={{ fontSize: 12, color: '#666', margin: 0 }}>{entry.insight}</p>
                </IonLabel>
                <IonText slot="end" style={{ fontSize: 11, color: '#aaa', textAlign: 'right' }}>
                  <p style={{ margin: 0 }}>
                    {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                  <p style={{ margin: 0 }}>
                    {entry.timestamp.toLocaleDateString()}
                  </p>
                </IonText>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
