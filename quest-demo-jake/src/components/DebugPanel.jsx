/**
 * DebugPanel - Displays system status and logs on screen
 * Helps diagnose issues on Quest/Mobile devices
 */

import React, { useState, useEffect } from 'react';

const LOG_MAX = 5;

// Global log interceptor
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

export function DebugPanel({ voiceCommand, voiceRecorder }) {
    const [logs, setLogs] = useState([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Intercept logs
        const handleLog = (type, args) => {
            const msg = args.map(arg => {
                if (typeof arg === 'object') return JSON.stringify(arg);
                return String(arg);
            }).join(' ');

            setLogs(prev => {
                const newLogs = [...prev, `[${type}] ${msg}`];
                return newLogs.slice(-LOG_MAX);
            });

            if (type === 'log') originalConsoleLog(...args);
            if (type === 'error') originalConsoleError(...args);
        };

        console.log = (...args) => handleLog('log', args);
        console.error = (...args) => handleLog('error', args);

        return () => {
            console.log = originalConsoleLog;
            console.error = originalConsoleError;
        };
    }, []);

    if (!isVisible) {
        return (
            <button
                onClick={() => setIsVisible(true)}
                style={{
                    position: 'fixed',
                    bottom: '10px',
                    right: '10px',
                    zIndex: 9999,
                    padding: '8px',
                    background: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    border: '1px solid white',
                    borderRadius: '50%',
                    fontSize: '12px'
                }}
            >
                🐛
            </button>
        );
    }

    const checkSupport = (api) => api in window ? '✅' : '❌';

    return (
        <div style={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            width: '300px',
            background: 'rgba(0, 0, 0, 0.9)',
            color: '#0f0',
            padding: '10px',
            borderRadius: '10px',
            fontSize: '11px',
            fontFamily: 'monospace',
            zIndex: 9999,
            border: '1px solid #333'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <strong>SYSTEM INFO</strong>
                <button onClick={() => setIsVisible(false)} style={{ background: 'none', border: 'none', color: 'white' }}>✕</button>
            </div>

            <div style={{ marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                <div>SpeechRecognition: {checkSupport('SpeechRecognition') || checkSupport('webkitSpeechRecognition')}</div>
                <div>MediaRecorder: {checkSupport('MediaRecorder')}</div>
                <div>WebXR: {checkSupport('xr') ? '✅' : (navigator.xr ? '✅' : '❌')}</div>
                <div>Secure Context: {window.isSecureContext ? '✅' : '❌'}</div>
                <div>Hostname: {window.location.hostname}</div>
            </div>

            <div style={{ marginBottom: '10px', borderBottom: '1px solid #333', paddingBottom: '5px' }}>
                <strong>STATUS</strong>
                <div>Mic Permission: {voiceRecorder.permissionGranted ? 'Granted' : 'Pending/Denied'}</div>
                <div>Recording: {voiceRecorder.isRecording ? 'YES' : 'NO'}</div>
                <div>Listening: {voiceCommand.isListening ? 'YES' : 'NO'}</div>
                <div>Supported: {voiceCommand.isSupported ? 'YES' : 'NO'}</div>
            </div>

            <div>
                <strong>LOGS</strong>
                {logs.map((log, i) => (
                    <div key={i} style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: log.includes('[error]') ? '#ff5555' : '#0f0'
                    }}>
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
}
