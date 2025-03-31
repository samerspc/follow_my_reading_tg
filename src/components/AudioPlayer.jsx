import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import ChunkHighlighter from './ChunkHighlighter';

const format = 'ogg';
export default function AudioPlayer({ base64, chunks, text }) {
    const containerRef = useRef(null);
    const waveRef = useRef(null);

    const [isReady, setIsReady] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [error, setError] = useState(null);

    const initWaveSurfer = () => {
        if (!containerRef.current || isInitialized) return;

        const wave = WaveSurfer.create({
            container: containerRef.current,
            waveColor: '#ccc',
            progressColor: '#007aff',
            height: 80,
        });

        waveRef.current = wave;
        setIsInitialized(true);

        const audioUrl = `data:audio/ogg;base64,${base64}`;
        wave.load(audioUrl);
        

        wave.on('error', (e) => {
            console.error('WaveSurfer error:', e);
            setError(e.toString());
        });

        wave.on('ready', () => {
            console.log('WaveSurfer ready');
            setIsReady(true);
        });

        wave.on('audioprocess', () => {
            setCurrentTime(wave.getCurrentTime());
        });
    };

    const handlePlayPause = () => {
        if (waveRef.current && isReady) {
            waveRef.current.playPause();
        }
    };

    useEffect(() => {
        return () => {
            if (waveRef.current) {
                waveRef.current.destroy();
                waveRef.current = null;
            }
        };
    }, []);

    return (
        <div style={{ marginBottom: '30px' }}>
            <div ref={containerRef} style={{ width: '100%', height: '100px' }} />

            {!isInitialized && (
                <button onClick={initWaveSurfer} style={{ marginTop: '20px' }}>
                    🔄 Инициализировать аудиоплеер | {format}
                </button>
            )}

            <hr />

            {error && <p style={{ color: 'red' }}>Ошибка: {error}</p>}

            <button onClick={handlePlayPause} disabled={!isReady} style={{ marginTop: '20px' }}>
                ▶️ {isReady ? 'Play/Pause' : 'Загрузка...'}
            </button>

            <hr />
            <p>🧠 Синхронизированный текст:</p>
            <ChunkHighlighter text={text} currentTime={currentTime} chunks={chunks} />
        </div>
    );
}