# Flask Backend Server

This is the backend microservice for the IIT Jodhpur Real-time Healthcare and Location Tracking system. It connects to the Firebase Realtime Database using the `firebase-admin` SDK, monitors the live patient vitals via a real-time event listener, triggers SMS warnings on anomalies (low SpO2 or high body temperature), and provides health check APIs.

## Setup Instructions

1. **Navigate to the Backend Directory**:
   ```bash
   cd backend
   ```

2. **Create a Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Service Account Key**:
   - Go to your **Firebase Console** -> **Project Settings** -> **Service Accounts**.
   - Click **Generate new private key** and download the JSON file.
   - Save it as `serviceAccountKey.json` in the `backend/` directory (it is git-ignored by default).

5. **Configure Environment Variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
   FIREBASE_SERVICE_ACCOUNT_KEY=serviceAccountKey.json
   PORT=5001
   ```

6. **Run the Server**:
   ```bash
   python app.py
   ```

The health check endpoint will be available at: `http://localhost:5001/api/status`
