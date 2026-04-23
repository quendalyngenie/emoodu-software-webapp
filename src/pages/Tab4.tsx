// // src/pages/Tab4.tsx
// import React, { useRef, useState, useEffect } from 'react';
// import {
//     IonPage, IonHeader, IonToolbar, IonTitle, IonContent
// } from '@ionic/react';
// import { useBle } from '../context/BleContext';
// import { Mood } from '../services/BleService';
// import songFile from '../assets/music/song.mp3';

// // ── Emotion → speed mapping ───────────────────────────────
// const MOOD_SPEED: Record<Mood, number> = {
//     calm: 0.7,
//     active: 1.3,
//     overstimulated: 2.0,
//     selfregulating: 1.0,
//     unknown: 1.0,
// };

// const MOOD_LABEL: Record<Mood, string> = {
//     calm: '😌 Calm',
//     active: '⚡ Active',
//     overstimulated: '🤯 Overstimulated',
//     selfregulating: '🔄 Self Regulating',
//     unknown: '❓ Unknown',
// };

// const Tab4: React.FC = () => {
//     const { connected, slots, djSpeed } = useBle();
//     const audioRef = useRef<HTMLAudioElement | null>(null);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [manualSpeed, setManualSpeed] = useState(1.0);
//     const [useEmotion, setUseEmotion] = useState(true); // toggle emotion vs manual

//     const djSlot = slots.find(s => s.module === 'djdisc');
//     const djActive = connected && djSlot !== null && djSlot !== undefined;

//     // ── Determine active speed ────────────────────────────────
//     const emotionSpeed = djSlot ? MOOD_SPEED[djSlot.mood] : 1.0;
//     const activeSpeed = djActive
//         ? (useEmotion ? emotionSpeed : djSpeed) // on device: emotion or raw spin speed
//         : manualSpeed;                           // in browser: manual slider

//     // ── Apply speed/pitch ─────────────────────────────────────
//     useEffect(() => {
//         if (!audioRef.current) return;
//         const rate = Math.max(0.25, Math.min(4.0, activeSpeed));
//         audioRef.current.playbackRate = rate;
//         audioRef.current.preservesPitch = false;
//         (audioRef.current as any).mozPreservesPitch = false;
//     }, [activeSpeed]);

//     // ── Play/pause ────────────────────────────────────────────
//     useEffect(() => {
//         if (!audioRef.current) return;
//         if (isPlaying) {
//             audioRef.current.play().catch(console.error);
//         } else {
//             audioRef.current.pause();
//         }
//     }, [isPlaying]);

//     // ── Stop if DJ Disc removed ───────────────────────────────
//     useEffect(() => {
//         if (!djActive && audioRef.current) {
//             audioRef.current.pause();
//             audioRef.current.currentTime = 0;
//             setIsPlaying(false);
//         }
//     }, [djActive]);

//     // ── Speed display ─────────────────────────────────────────
//     const speedInfo = (s: number) => {
//         if (s < 0.5) return { label: 'Very Slow', color: '#4A90D9' };
//         if (s < 0.9) return { label: 'Slow', color: '#50C8E8' };
//         if (s < 1.2) return { label: 'Normal', color: '#7ED321' };
//         if (s < 2.0) return { label: 'Fast', color: '#F5A623' };
//         return { label: 'Very Fast', color: '#E84040' };
//     };
//     const speed = speedInfo(activeSpeed);

//     return (
//         <IonPage>
//             <IonHeader>
//                 <IonToolbar>
//                     <IonTitle>Music Mode</IonTitle>
//                 </IonToolbar>
//             </IonHeader>
//             <IonContent>

//                 <audio ref={audioRef} src={songFile} loop />

//                 <div style={{
//                     display: 'flex', flexDirection: 'column',
//                     alignItems: 'center', justifyContent: 'center',
//                     height: '100%', padding: 24, gap: 20,
//                 }}>

//                     {/* Spinning disc */}
//                     <div style={{
//                         width: 180, height: 180, borderRadius: '50%',
//                         backgroundColor: '#9B59B6',
//                         display: 'flex', alignItems: 'center', justifyContent: 'center',
//                         boxShadow: isPlaying ? '0 0 48px #9B59B666' : 'none',
//                         animation: isPlaying
//                             ? `spin ${Math.max(0.3, 3 / activeSpeed)}s linear infinite`
//                             : 'none',
//                         transition: 'box-shadow 0.4s ease',
//                     }}>
//                         <div style={{
//                             width: 110, height: 110, borderRadius: '50%',
//                             border: '2px solid rgba(255,255,255,0.15)',
//                             display: 'flex', alignItems: 'center', justifyContent: 'center',
//                         }}>
//                             <div style={{
//                                 width: 70, height: 70, borderRadius: '50%',
//                                 backgroundColor: '#7B3D9E',
//                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                             }}>
//                                 <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: '#FDFAF5' }} />
//                             </div>
//                         </div>
//                     </div>

//                     <style>{`
//             @keyframes spin {
//               from { transform: rotate(0deg); }
//               to   { transform: rotate(360deg); }
//             }
//           `}</style>

//                     {/* Play/Pause */}
//                     <button
//                         onClick={() => setIsPlaying(p => !p)}
//                         style={{
//                             width: 56, height: 56, borderRadius: '50%',
//                             backgroundColor: isPlaying ? '#E84040' : '#9B59B6',
//                             border: 'none', cursor: 'pointer',
//                             fontSize: 22, color: 'white',
//                             display: 'flex', alignItems: 'center', justifyContent: 'center',
//                             transition: 'background-color 0.3s ease',
//                         }}
//                     >
//                         {isPlaying ? '⏸' : '▶️'}
//                     </button>

//                     {/* Speed badge */}
//                     <div style={{
//                         backgroundColor: speed.color,
//                         padding: '10px 24px', borderRadius: 28,
//                         display: 'flex', alignItems: 'center', gap: 10,
//                         transition: 'background-color 0.3s ease',
//                         boxShadow: `0 4px 16px ${speed.color}44`,
//                     }}>
//                         <span style={{ fontSize: 18 }}>🎛️</span>
//                         <div>
//                             <p style={{
//                                 fontSize: 9, color: 'rgba(255,255,255,0.7)',
//                                 margin: '0 0 2px', letterSpacing: 0.8, textTransform: 'uppercase',
//                             }}>
//                                 Speed
//                             </p>
//                             <p style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: 0 }}>
//                                 {speed.label} · {activeSpeed.toFixed(1)}x
//                             </p>
//                         </div>
//                     </div>

//                     {/* Speed bar */}
//                     <div style={{ width: '100%', maxWidth: 300 }}>
//                         <div style={{ height: 8, backgroundColor: '#f0f0f0', borderRadius: 4, overflow: 'hidden' }}>
//                             <div style={{
//                                 height: '100%',
//                                 width: `${Math.min(100, (activeSpeed / 3) * 100)}%`,
//                                 backgroundColor: speed.color,
//                                 borderRadius: 4,
//                                 transition: 'width 0.3s ease, background-color 0.3s ease',
//                             }} />
//                         </div>
//                         <div style={{
//                             display: 'flex', justifyContent: 'space-between',
//                             marginTop: 6, fontSize: 10, color: '#A89880',
//                         }}>
//                             <span>0.1x</span>
//                             <span>1.5x</span>
//                             <span>3.0x</span>
//                         </div>
//                     </div>

//                     {/* ── Emotion speed toggle ── */}
//                     <div style={{
//                         width: '100%', maxWidth: 300,
//                         backgroundColor: '#f8f8f8', borderRadius: 16,
//                         padding: '14px 16px', border: '1px solid #E2D9C8',
//                     }}>
//                         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
//                             <div>
//                                 <p style={{ fontSize: 12, fontWeight: 700, color: '#2C2416', margin: 0 }}>
//                                     Emotion Speed
//                                 </p>
//                                 <p style={{ fontSize: 10, color: '#A89880', margin: '2px 0 0' }}>
//                                     Music tempo follows child's mood
//                                 </p>
//                             </div>
//                             {/* Toggle switch */}
//                             <div
//                                 onClick={() => setUseEmotion(p => !p)}
//                                 style={{
//                                     width: 44, height: 24, borderRadius: 12,
//                                     backgroundColor: useEmotion ? '#9B59B6' : '#ccc',
//                                     position: 'relative', cursor: 'pointer',
//                                     transition: 'background-color 0.3s ease', flexShrink: 0,
//                                 }}
//                             >
//                                 <div style={{
//                                     position: 'absolute', top: 3,
//                                     left: useEmotion ? 22 : 2,
//                                     width: 18, height: 18, borderRadius: '50%',
//                                     backgroundColor: 'white',
//                                     transition: 'left 0.3s ease',
//                                     boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
//                                 }} />
//                             </div>
//                         </div>

//                         {/* Emotion speed table */}
//                         <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
//                             {(Object.entries(MOOD_SPEED) as [Mood, number][])
//                                 .filter(([m]) => m !== 'unknown')
//                                 .map(([mood, spd]) => {
//                                     const info = speedInfo(spd);
//                                     const isCurrent = djSlot?.mood === mood;
//                                     return (
//                                         <div key={mood} style={{
//                                             display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//                                             padding: '6px 10px', borderRadius: 10,
//                                             backgroundColor: isCurrent && useEmotion ? `${info.color}22` : 'transparent',
//                                             border: isCurrent && useEmotion ? `1px solid ${info.color}44` : '1px solid transparent',
//                                             transition: 'all 0.3s ease',
//                                         }}>
//                                             <span style={{ fontSize: 13, color: '#2C2416' }}>
//                                                 {MOOD_LABEL[mood]}
//                                             </span>
//                                             <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                                                 <span style={{
//                                                     fontSize: 10, color: info.color, fontWeight: 700,
//                                                 }}>
//                                                     {info.label}
//                                                 </span>
//                                                 <span style={{
//                                                     fontSize: 10, color: '#A89880',
//                                                     backgroundColor: '#f0f0f0', padding: '2px 6px',
//                                                     borderRadius: 8,
//                                                 }}>
//                                                     {spd}x
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                         </div>
//                     </div>

//                     {/* Manual speed slider — shown when emotion toggle OFF */}
//                     {!useEmotion && (
//                         <div style={{ width: '100%', maxWidth: 300 }}>
//                             <p style={{
//                                 fontSize: 11, fontWeight: 600, color: '#A89880',
//                                 margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.8,
//                             }}>
//                                 Manual Speed
//                             </p>
//                             <input
//                                 type="range"
//                                 min={0.1} max={3.0} step={0.1}
//                                 value={manualSpeed}
//                                 onChange={e => setManualSpeed(parseFloat(e.target.value))}
//                                 style={{ width: '100%' }}
//                             />
//                             <div style={{
//                                 display: 'flex', justifyContent: 'space-between',
//                                 marginTop: 4, fontSize: 10, color: '#A89880',
//                             }}>
//                                 <span>Slow</span>
//                                 <span>Normal</span>
//                                 <span>Fast</span>
//                             </div>
//                         </div>
//                     )}

//                 </div>
//             </IonContent>
//         </IonPage>
//     );
// };

// export default Tab4;
// src/pages/Tab4.tsx
import React, { useRef, useState, useEffect } from 'react';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent
} from '@ionic/react';
import { useBle } from '../context/BleContext';
import { Mood } from '../services/BleService';
import songFile from '../assets/music/song.mp3';

const MOOD_SPEED: Record<Mood, number> = {
    calm: 0.7,
    active: 1.3,
    overstimulated: 2.0,
    selfregulating: 1.0,
    unknown: 1.0,
};

const MOOD_LABEL: Record<Mood, string> = {
    calm: '😌 Calm',
    active: '⚡ Active',
    overstimulated: '🤯 Overstimulated',
    selfregulating: '🔄 Self Regulating',
    unknown: '❓ Unknown',
};

const Tab4: React.FC = () => {
    const { connected, slots } = useBle();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const djSlot = slots.find(s => s.module === 'djdisc');
    const djActive = connected && djSlot !== null && djSlot !== undefined;
    const currentMood = djSlot?.mood ?? 'unknown';
    const activeSpeed = MOOD_SPEED[currentMood];

    // ── Apply speed whenever mood changes ────────────────────
    useEffect(() => {
        if (!audioRef.current) return;
        const rate = Math.max(0.25, Math.min(4.0, activeSpeed));
        audioRef.current.playbackRate = rate;
        audioRef.current.preservesPitch = false;
        (audioRef.current as any).mozPreservesPitch = false;
    }, [activeSpeed]);

    // ── Stop when DJ Disc removed ─────────────────────────────
    useEffect(() => {
        if (!djActive && audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            setIsPlaying(false);
        }
    }, [djActive]);

    // ── Play / Pause handler ──────────────────────────────────
    const handlePlayPause = async () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            try {
                audioRef.current.playbackRate = Math.max(0.25, Math.min(4.0, activeSpeed));
                audioRef.current.preservesPitch = false;
                (audioRef.current as any).mozPreservesPitch = false;
                await audioRef.current.play();
                setIsPlaying(true);
            } catch (e) {
                console.error('Play failed:', e);
            }
        }
    };

    // ── Speed display ─────────────────────────────────────────
    const speedInfo = (s: number) => {
        if (s < 0.5) return { label: 'Very Slow', color: '#4A90D9' };
        if (s < 0.9) return { label: 'Slow', color: '#50C8E8' };
        if (s < 1.2) return { label: 'Normal', color: '#7ED321' };
        if (s < 2.0) return { label: 'Fast', color: '#F5A623' };
        return { label: 'Very Fast', color: '#E84040' };
    };
    const speed = speedInfo(activeSpeed);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Music Mode</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>

                <audio
                    ref={audioRef}
                    src={songFile}
                    loop
                    onCanPlay={() => console.log('Audio ready')}
                    onError={(e) => console.error('Audio error:', e)}
                />

                <div style={{
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    height: '100%', padding: 24, gap: 24,
                }}>

                    {/* Not connected */}
                    {!connected && (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 48, marginBottom: 12 }}>🎵</p>
                            <p style={{ color: '#A89880', fontSize: 15 }}>
                                Connect to emoodu to use Music Mode
                            </p>
                        </div>
                    )}

                    {/* Connected but no DJ Disc */}
                    {connected && !djActive && (
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 48, marginBottom: 12 }}>🎧</p>
                            <p style={{ color: '#A89880', fontSize: 15 }}>
                                Insert the DJ Disc module to start music
                            </p>
                            <p style={{ color: '#ccc', fontSize: 12, marginTop: 8 }}>
                                Music speed changes with child's emotion
                            </p>
                        </div>
                    )}

                    {/* DJ Disc active */}
                    {connected && djActive && (
                        <>
                            {/* Spinning disc */}
                            <div style={{
                                width: 180, height: 180, borderRadius: '50%',
                                backgroundColor: '#9B59B6',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: isPlaying ? '0 0 48px #9B59B666' : 'none',
                                animation: isPlaying
                                    ? `spin ${Math.max(0.3, 3 / activeSpeed)}s linear infinite`
                                    : 'none',
                                transition: 'box-shadow 0.4s ease',
                            }}>
                                <div style={{
                                    width: 110, height: 110, borderRadius: '50%',
                                    border: '2px solid rgba(255,255,255,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <div style={{
                                        width: 70, height: 70, borderRadius: '50%',
                                        backgroundColor: '#7B3D9E',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <div style={{
                                            width: 18, height: 18, borderRadius: '50%',
                                            backgroundColor: '#FDFAF5',
                                        }} />
                                    </div>
                                </div>
                            </div>

                            <style>{`
                @keyframes spin {
                  from { transform: rotate(0deg); }
                  to   { transform: rotate(360deg); }
                }
              `}</style>

                            {/* Play / Pause button */}
                            <button
                                onClick={handlePlayPause}
                                style={{
                                    width: 64, height: 64, borderRadius: '50%',
                                    backgroundColor: isPlaying ? '#E84040' : '#9B59B6',
                                    border: 'none', cursor: 'pointer',
                                    fontSize: 24, color: 'white',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background-color 0.3s ease',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                }}
                            >
                                {isPlaying ? '⏸' : '▶️'}
                            </button>

                            {/* Status */}
                            <div style={{ textAlign: 'center' }}>
                                <p style={{ fontSize: 18, fontWeight: 700, color: '#2C2416', margin: '0 0 4px' }}>
                                    {isPlaying ? '♪ Now Playing' : '⏸ Paused'}
                                </p>
                                <p style={{ fontSize: 12, color: '#A89880', margin: 0 }}>
                                    Speed follows {MOOD_LABEL[currentMood]}
                                </p>
                            </div>

                            {/* Speed badge */}
                            <div style={{
                                backgroundColor: speed.color,
                                padding: '10px 24px', borderRadius: 28,
                                display: 'flex', alignItems: 'center', gap: 10,
                                transition: 'background-color 0.3s ease',
                                boxShadow: `0 4px 16px ${speed.color}44`,
                            }}>
                                <span style={{ fontSize: 18 }}>🎛️</span>
                                <div>
                                    <p style={{
                                        fontSize: 9, color: 'rgba(255,255,255,0.7)',
                                        margin: '0 0 2px', letterSpacing: 0.8, textTransform: 'uppercase',
                                    }}>
                                        Speed
                                    </p>
                                    <p style={{ fontSize: 16, fontWeight: 700, color: 'white', margin: 0 }}>
                                        {speed.label} · {activeSpeed.toFixed(1)}x
                                    </p>
                                </div>
                            </div>

                            {/* Speed bar */}
                            <div style={{ width: '100%', maxWidth: 300 }}>
                                <div style={{
                                    height: 8, backgroundColor: '#f0f0f0',
                                    borderRadius: 4, overflow: 'hidden',
                                }}>
                                    <div style={{
                                        height: '100%',
                                        width: `${Math.min(100, (activeSpeed / 3) * 100)}%`,
                                        backgroundColor: speed.color,
                                        borderRadius: 4,
                                        transition: 'width 0.3s ease, background-color 0.3s ease',
                                    }} />
                                </div>
                                <div style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    marginTop: 6, fontSize: 10, color: '#A89880',
                                }}>
                                    <span>0.1x Slow</span>
                                    <span>1.5x Normal</span>
                                    <span>3.0x Fast</span>
                                </div>
                            </div>

                            {/* Emotion speed reference */}
                            <div style={{
                                width: '100%', maxWidth: 300,
                                backgroundColor: '#f8f8f8', borderRadius: 16,
                                padding: '14px 16px', border: '1px solid #E2D9C8',
                            }}>
                                <p style={{
                                    fontSize: 11, fontWeight: 700, color: '#2C2416',
                                    margin: '0 0 10px', letterSpacing: 0.5,
                                }}>
                                    Emotion → Speed
                                </p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {(Object.entries(MOOD_SPEED) as [Mood, number][])
                                        .filter(([m]) => m !== 'unknown')
                                        .map(([mood, spd]) => {
                                            const info = speedInfo(spd);
                                            const isCurrent = currentMood === mood;
                                            return (
                                                <div key={mood} style={{
                                                    display: 'flex', alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '6px 10px', borderRadius: 10,
                                                    backgroundColor: isCurrent ? `${info.color}22` : 'transparent',
                                                    border: isCurrent ? `1px solid ${info.color}66` : '1px solid transparent',
                                                    transition: 'all 0.3s ease',
                                                }}>
                                                    <span style={{
                                                        fontSize: 13,
                                                        color: isCurrent ? '#2C2416' : '#A89880',
                                                        fontWeight: isCurrent ? 700 : 400,
                                                    }}>
                                                        {MOOD_LABEL[mood]}
                                                    </span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <span style={{ fontSize: 10, color: info.color, fontWeight: 700 }}>
                                                            {info.label}
                                                        </span>
                                                        <span style={{
                                                            fontSize: 10, color: '#A89880',
                                                            backgroundColor: '#f0f0f0',
                                                            padding: '2px 6px', borderRadius: 8,
                                                        }}>
                                                            {spd}x
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Tab4;

