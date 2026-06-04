# ESP32 Firebase Integration Guide

This guide shows you the exact code modifications and specific `#include` statements needed to push the sensor readings to Firebase Realtime Database using the `FirebaseESP32` library by Mobizt.

## Library Requirement
In your Arduino IDE Library Manager or PlatformIO, install:
* **Firebase ESP32 Client** (by Mobizt)

---

## 1. Include Statements and Global Definitions
Add the following blocks to the top of your code, right after the other `#include` statements:

```cpp
// --- BEGIN FIREBASE ADDITIONS ---
#include <WiFi.h>
#include <FirebaseESP32.h>

// WiFi and Firebase credentials (replace with your details)
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"
#define FIREBASE_HOST "YOUR_PROJECT_ID-default-rtdb.firebaseio.com" // Without https://
#define FIREBASE_AUTH "YOUR_FIREBASE_DATABASE_SECRET"                 // Database secret or API key

// Firebase integration objects
FirebaseData firebaseData;
FirebaseAuth auth;
FirebaseConfig config;
// --- END FIREBASE ADDITIONS ---
```

---

## 2. Changes to `setup()`
Add the Wi-Fi connection logic and Firebase initialization code at the end of your `setup()` function:

```cpp
void setup()
{
  Serial.begin(115200);

  Wire.begin(21,22);

  Serial.println("Initializing...");

  // MLX90614
  if(!mlx.begin())
  {
    Serial.println("MLX90614 not found!");
    while(1);
  }

  // MAX30102
  if(!particleSensor.begin(Wire, I2C_SPEED_STANDARD))
  {
    Serial.println("MAX30102 not found!");
    while(1);
  }

  particleSensor.setup();

  particleSensor.setPulseAmplitudeRed(0x1F);
  particleSensor.setPulseAmplitudeIR(0x1F);

  // GPS
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17);

  // --- BEGIN FIREBASE ADDITIONS ---
  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(500);
  }
  Serial.println("\nWiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  // Initialize Firebase Config & Auth
  config.host = FIREBASE_HOST;
  config.signer.tokens.legacy_token = FIREBASE_AUTH;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  // --- END FIREBASE ADDITIONS ---

  Serial.println("System Ready");
}
```

---

## 3. Changes to `loop()`
Add the database update calls inside the existing print interval block in `loop()` where sensor metrics are already calculated and printed:

```cpp
  if(millis() - lastPrint > 2000)
  {
    lastPrint = millis();

    float ambientTemp = mlx.readAmbientTempC();
    float bodyTemp = mlx.readObjectTempC();

    Serial.println();
    Serial.println("======================");

    Serial.print("IR Value: ");
    Serial.println(irValue);

    int spo2 = 0;
    int bpmToSend = 0;

    if(irValue < 50000)
    {
      Serial.println("Finger: NOT DETECTED");
    }
    else
    {
      Serial.print("BPM: ");
      Serial.println(beatAvg);
      bpmToSend = beatAvg;

      // Approximate SpO2 estimation
      spo2 = map(irValue, 50000, 120000, 94, 100);

      if(spo2 > 100) spo2 = 100;
      if(spo2 < 90) spo2 = 90;

      Serial.print("SpO2: ");
      Serial.print(spo2);
      Serial.println("%");
    }

    Serial.print("Body Temp: ");
    Serial.print(bodyTemp);
    Serial.println(" C");

    Serial.print("Ambient Temp: ");
    Serial.print(ambientTemp);
    Serial.println(" C");

    // --- BEGIN FIREBASE ADDITIONS ---
    // Push Vitals to Firebase Realtime Database
    if (WiFi.status() == WL_CONNECTED)
    {
      String path = "DogCollar/live";
      Firebase.RTDB.setInt(&firebaseData, path + "/bpm", bpmToSend);
      Firebase.RTDB.setInt(&firebaseData, path + "/spo2", spo2);
      Firebase.RTDB.setFloat(&firebaseData, path + "/bodyTemp", bodyTemp);
      Firebase.RTDB.setFloat(&firebaseData, path + "/ambientTemp", ambientTemp);
      // Firebase automatically records server timestamp if needed, or frontend assumes current time.
    }
    // --- END FIREBASE ADDITIONS ---

    if(gps.location.isValid())
    {
      Serial.print("Latitude : ");
      Serial.println(gps.location.lat(), 6);

      Serial.print("Longitude: ");
      Serial.println(gps.location.lng(), 6);

      Serial.print("Satellites: ");
      Serial.println(gps.satellites.value());

      // --- BEGIN FIREBASE ADDITIONS ---
      // Push Location to Firebase Realtime Database
      if (WiFi.status() == WL_CONNECTED)
      {
        String path = "DogCollar/live";
        Firebase.RTDB.setFloat(&firebaseData, path + "/lat", gps.location.lat());
        Firebase.RTDB.setFloat(&firebaseData, path + "/lng", gps.location.lng());
      }
      // --- END FIREBASE ADDITIONS ---
    }
    else
    {
      Serial.println("GPS: Waiting for Fix");
      Serial.print("Satellites: ");
      Serial.println(gps.satellites.value());
    }

    Serial.println("======================");
  }
```
