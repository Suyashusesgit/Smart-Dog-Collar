# React Dashboard (Vite + Tailwind CSS + React Leaflet)

This is the front-end dashboard for the IIT Jodhpur Real-time Healthcare and Location Tracking system. It allows researchers and supervisors to monitor live biometric telemetry (BPM, SpO2, Temperature) and GPS positioning of subjects.

## Features

- **Live Firebase Integration**: Receives real-time database push events automatically.
- **Interactive Mock Mode**: Includes an offline toggle mimicking live telemetry streams and slight GPS walks around IIT Jodhpur, with interactive simulator buttons to trigger alarms (low SpO2 / fever state).
- **Responsive Dark Design**: Premium look utilizing custom dark gradients, Outfit typography, and glowing glassmorphism telemetry cards.
- **React Leaflet Map**: Smooth dark tiles indicating GPS position with an active pulsing heartbeat marker icon.

## Setup Instructions

1. **Navigate to the Frontend Directory**:
   ```bash
   cd frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `frontend/` directory to connect your database:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
   *(If this `.env` is omitted, the app will default to **Mock IoT Feed** mode automatically so you can immediately see the working system and animations).*

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```

The dashboard will be available at: `http://localhost:5173`
