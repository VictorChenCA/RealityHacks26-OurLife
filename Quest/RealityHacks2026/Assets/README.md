# RealityHacks 2026 - Quest VR Query Interface

A Unity VR application for Meta Quest that interfaces with the memory query backend.

## Features

- **Voice Query**: Hold right trigger to record, release to send query
- **Debug Terminal**: Press and hold left joystick for 30 seconds to toggle
- **Mic Status Indicator**: Green when recording + connected, grey otherwise
- **WebSocket Communication**: Real-time backend queries per `query_data.md` spec

## Project Structure

```
Assets/
├── Scripts/
│   ├── Core/
│   │   ├── QueryController.cs      # Main orchestrator
│   │   └── AppConfig.cs            # ScriptableObject config
│   ├── Network/
│   │   ├── QueryWebSocketClient.cs # WebSocket client
│   │   ├── NativeWebSocket.cs      # Cross-platform WebSocket
│   │   └── UnityMainThreadDispatcher.cs
│   ├── Audio/
│   │   ├── MicrophoneManager.cs    # Recording handler
│   │   └── SpeechToTextHandler.cs  # Whisper API integration
│   ├── Input/
│   │   └── VRInputManager.cs       # Quest controller input
│   ├── UI/
│   │   ├── DebugTerminal.cs        # Log display
│   │   └── MicrophoneStatusIndicator.cs
│   └── Editor/
│       └── QuerySystemSetup.cs     # Setup wizard
└── Scenes/
    └── SampleScene.unity
```

## Quick Setup

1. Open Unity and let packages import (XR Interaction Toolkit, Oculus XR)
2. Go to **RealityHacks > Setup Query System** in menu bar
3. Click each button to create the required GameObjects
4. Configure the `QueryWebSocketClient` component:
   - Set `Server Host` to your backend URL
   - Set `User Id` for the session
5. (Optional) Set Whisper API key in `SpeechToTextHandler` for speech-to-text

## Controls

| Action | Input |
|--------|-------|
| Start Recording | Hold Right Trigger |
| Stop Recording & Send | Release Right Trigger |
| Toggle Debug Terminal | Hold Left Joystick Click (30s) |

## Component Configuration

### QueryWebSocketClient
- `Server Host`: Backend server hostname (without protocol)
- `User Id`: User identifier for WebSocket connection
- `Use SSL`: Enable for wss:// connections

### VRInputManager
- `Trigger Threshold`: Sensitivity for trigger press (0.8 default)
- `Joystick Press Hold Time`: Seconds to hold for debug toggle (30s)

### MicrophoneManager
- `Sample Rate`: Audio sample rate (16000 Hz)
- `Max Recording Seconds`: Maximum recording duration (30s)

## API Reference

The app communicates with the backend via:

1. **WebSocket**: `wss://{host}/ws/query/{user_id}`
   - Send: `{"text": "query", "includeFaces": true, "maxImages": 8}`
   - Receive: `{"type": "response", "answer": "...", ...}`

2. **HTTP Upload**: `POST /query-upload/{query_id}` (optional image attachment)

See `query_data.md` for full API documentation.

## Build for Quest

1. Switch to Android platform: **File > Build Settings > Android**
2. Enable XR in **Project Settings > XR Plug-in Management > Oculus**
3. Set texture compression to ASTC
4. Build and deploy to Quest

## Dependencies

- Unity 2022.3+ (LTS recommended)
- XR Interaction Toolkit 2.5.4
- Oculus XR Plugin 4.2.0
- TextMeshPro 3.0.7
