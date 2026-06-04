import os
import logging
from flask import Flask, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, db
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend requests

# Path to service account and DB URL
SERVICE_ACCOUNT_KEY = os.getenv("FIREBASE_SERVICE_ACCOUNT_KEY", "serviceAccountKey.json")
DATABASE_URL = os.getenv("FIREBASE_DATABASE_URL", "https://smart-dog-8010a-default-rtdb.asia-southeast1.firebasedatabase.app")

firebase_app = None
listener_ref = None

import json

def init_firebase():
    global firebase_app
    try:
        # 1. Render Deployment: Read credentials from raw JSON environment variable
        credentials_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
        
        if credentials_json:
            cred_dict = json.loads(credentials_json)
            cred = credentials.Certificate(cred_dict)
            firebase_app = firebase_admin.initialize_app(cred, {
                'databaseURL': DATABASE_URL
            })
            logger.info("Firebase Admin SDK initialized successfully via Environment Variable.")
            
        # 2. Local Development: Read from service account file
        elif os.path.exists(SERVICE_ACCOUNT_KEY):
            cred = credentials.Certificate(SERVICE_ACCOUNT_KEY)
            firebase_app = firebase_admin.initialize_app(cred, {
                'databaseURL': DATABASE_URL
            })
            logger.info("Firebase Admin SDK initialized successfully with service account file.")
            
        # 3. Fallback: Default application credentials
        else:
            logger.warning(f"Service account file '{SERVICE_ACCOUNT_KEY}' and ENV var not found. Attempting application default credentials.")
            firebase_app = firebase_admin.initialize_app(options={
                'databaseURL': DATABASE_URL
            })
    except Exception as e:
        logger.error(f"Error initializing Firebase Admin SDK: {e}")

# Call Firebase init
init_firebase()

def send_simulated_sms(patient_id, vitals, reasons):
    print("\n" + "="*60)
    print("!!! SIMULATED SMS ALERT !!!")
    print("To: IIT Jodhpur Emergency Medical Team / Supervisor")
    print(f"Subject: Emergency Medical Warning for {patient_id}")
    print(f"Message: Critical status detected for {patient_id}!")
    for reason in reasons:
        print(f"  - {reason}")
    print(f"Current Vitals: BPM: {vitals.get('bpm', 'N/A')}, SpO2: {vitals.get('spo2', 'N/A')}%, Temp: {vitals.get('bodyTemp', 'N/A')} C")
    print("="*60 + "\n")

def firebase_listener(event):
    """
    Firebase RTDB Listener Callback.
    Runs in a background thread spawned by the Firebase Admin SDK.
    """
    logger.info(f"Firebase Event Received: type={event.event_type}, path={event.path}, data={event.data}")
    
    try:
        # Fetch the live DogCollar data to evaluate thresholds
        ref = db.reference('DogCollar/live')
        data = ref.get()
        if not data:
            return

        spo2 = data.get('spo2')
        body_temp = data.get('bodyTemp')
        alert_status = data.get('alertStatus', False)

        # Trigger alert conditions
        # Alert Logic: If SpO2 < 90% or Body Temp > 38.0 C
        trigger_alert = False
        reasons = []
        
        # Prevent false alert triggers if sensors are zero/initializing
        if spo2 is not None and 0 < spo2 < 90:
            trigger_alert = True
            reasons.append(f"Critical SpO2 level: {spo2}%")
        if body_temp is not None and body_temp > 38.0:
            trigger_alert = True
            reasons.append(f"Critical Body Temp: {body_temp} C")

        patient_id = "K9-Alpha"

        if trigger_alert:
            if not alert_status:
                # Update alert status in database
                logger.warning(f"[ALERT TRIGGERED] Patient: {patient_id}. Reasons: {', '.join(reasons)}")
                db.reference('DogCollar/live/alertStatus').set(True)
                # Simulated SMS Log
                send_simulated_sms(patient_id, data, reasons)
        else:
            if alert_status:
                # Clear alert status if conditions normalize
                logger.info(f"[ALERT RESOLVED] Patient: {patient_id} has stabilized.")
                db.reference('DogCollar/live/alertStatus').set(False)

    except Exception as e:
        logger.error(f"Error inside Firebase listener callback: {e}")

# Start Firebase Listener if Firebase is configured
if firebase_app:
    try:
        listener_ref = db.reference('DogCollar/live').listen(firebase_listener)
        logger.info("Firebase RTDB listener thread started successfully.")
    except Exception as e:
        logger.error(f"Failed to start Firebase RTDB listener: {e}")

@app.route('/api/status', methods=['GET'])
def get_status():
    """
    Health check endpoint.
    """
    db_connected = False
    try:
        # Check database connectivity
        db.reference('/').get(shallow=True)
        db_connected = True
    except Exception as e:
        logger.error(f"DB Healthcheck connection failed: {e}")

    return jsonify({
        "status": "healthy",
        "firebase_connected": db_connected,
        "listener_active": listener_ref is not None,
        "message": "IIT Jodhpur healthcare monitoring backend is active."
    }), 200

if __name__ == '__main__':
    port = int(os.getenv("PORT", 5001))
    # use_reloader=False is critical to prevent duplicate Firebase background listener threads
    app.run(host='0.0.0.0', port=port, debug=True, use_reloader=False)
