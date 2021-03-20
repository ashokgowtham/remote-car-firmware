#include "arduino.h"
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <TaskScheduler.h>
#include <EEPROM.h>
#include <ESP8266mDNS.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>

extern "C" {
  #include <user_interface.h>
}

#define VERSION_STRING "1.0"
// #define USE_STATIC_IP

// customizable options:
#define STATIC_IP_ADDRESS        192, 168, 0, 200
#define STATIC_IP_GATEWAY        192, 168, 0, 1
#define STATIC_IP_SUBNET         255,255,255,0
#define DEVICE_NAME              "Red remote car 1"
#define SEND_TOPIC               "devices/red_remote_car_1"
#define RECEIVE_TOPIC             "devices/red_remote_car_1/commands"
#define HEART_BEAT_DELAY 30000

const char* ssid = FILL_IN_SSID_STRING;
const char* password = FILL_IN_PASSWORD_STRING;
const char* mqttServer = "192.168.0.76";
// END customizable options

#define d0 16
#define d1 5
#define d2 4
#define d3 0
#define d4 2
#define d5 14
#define d6 12
#define d7 13
#define d8 15

#define ACCEL_MOTOR_A d0
#define ACCEL_MOTOR_B d1
#define TURN_MOTOR_A  d2
#define TURN_MOTOR_B  d3
#define ACCEL_MOTOR_ENABLE d4
#define TURN_MOTOR_ENABLE  d5


#define MOTOR_FORWARD_A         HIGH
#define MOTOR_FORWARD_B         HIGH
#define MOTOR_RIGHT_A           HIGH
#define MOTOR_RIGHT_B           HIGH
#define ACCEL_MOTOR_ENABLE_HIGH HIGH
#define TURN_MOTOR_ENABLE_HIGH  HIGH

#define clamp(value, min, max) ((value) > (max) ? (max) : ( (value) < (min) ? (min) : (value) ))

#define getOrDefault(object, key, defaultValue) (object.containsKey(key) ? object[key] : defaultValue)

#define stringEquals(str1, str2)    (strcmp(str1, str2)==0)
#define stringNotEquals(str1, str2) (strcmp(str1, str2)!=0)

void heartBeatCallback();

void stopCar();

Scheduler taskRunner;
//Task lockDoorTask(0, 1, &lockDoorCallback);
//Task beepTask(100, 4, &beepOnCallback);
Task heartBeatTask(HEART_BEAT_DELAY, TASK_FOREVER, &heartBeatCallback);

WiFiClient espClient;
PubSubClient client(espClient);

void heartBeatCallback() {
  uint32_t freeMemory = system_get_free_heap_size();

  Serial.print("free memory: ");
  Serial.println(freeMemory);

  char buffer[150];
  snprintf(buffer, sizeof(buffer), "[" DEVICE_NAME "] (%s) free_memory: %u", WiFi.localIP().toString().c_str(), freeMemory);
  client.publish(SEND_TOPIC, buffer);
}

void stopCar() {

}

//
//void stateChangeTo(LockStates newLockState) {
//  lockState = newLockState;
//  Serial.print("Lock state changed to ");
//  Serial.println(asInteger(newLockState));
//}

//void lockDoorCallback() {
//  Serial.println("Locking door.");
//  digitalWrite(LOCK_RELAY, DOOR_LOCKED);
//  digitalWrite(ENTRY_CARD_READER_LED, LED_RED);
//  digitalWrite(EXIT_CARD_READER_LED, LED_RED);
//  stateChangeTo(LockStates::LOCKED);
//}
//
//void lockDoorAfter(unsigned long durationMillis) {
//  lockDoorTask.restartDelayed(durationMillis);
//}
//
//void unlockDoor() {
//  digitalWrite(LOCK_RELAY, DOOR_UNLOCKED);
//  digitalWrite(ENTRY_CARD_READER_LED, LED_GREEN);
//  digitalWrite(EXIT_CARD_READER_LED, LED_GREEN);
//}
//
//void beep(int number_of_beeps, int beep_duration) {
//  number_of_beeps = clamp(number_of_beeps, 0, MAX_NUMBER_OF_BEEPS);
//  beep_duration = clamp(beep_duration, 0, MAX_BEEP_DURATION);
//  if(number_of_beeps != 0) {
//    beepTask.setInterval(beep_duration);
//    beepTask.setIterations(2 * number_of_beeps);
//    beepTask.setCallback(&beepOnCallback);
//    beepTask.restartDelayed(0);
//  }
//}
//
//void unlockDoorFor(unsigned long durationMillis, int number_of_beeps, int beep_duration) {
//  Serial.print("Unlocking door for ");
//  Serial.print(durationMillis);
//  Serial.println(" milliseconds");
//  unlockDoor();
//  beep(number_of_beeps, beep_duration);
//  lockDoorAfter(durationMillis);
//  stateChangeTo(LockStates::UNLOCKED_FOR_DURATION);
//}
//
//void beepOnCallback() {
//  digitalWrite(ENTRY_CARD_READER_BEEP, BEEP_ON);
//  digitalWrite(EXIT_CARD_READER_BEEP, BEEP_ON);
//  beepTask.setCallback(&beepOffCallback);
//}
//
//void beepOffCallback() {
//  digitalWrite(ENTRY_CARD_READER_BEEP, BEEP_OFF);
//  digitalWrite(EXIT_CARD_READER_BEEP, BEEP_OFF);
//  beepTask.setCallback(&beepOnCallback);
//}
//
//void beepForInvalidCard(int number_of_beeps, int beep_duration) {
//  Serial.println("Beeping for invalid card.");
//  digitalWrite(ENTRY_CARD_READER_LED, LED_RED);
//  digitalWrite(EXIT_CARD_READER_LED, LED_RED);
//  beep(number_of_beeps, beep_duration);
//}
//
//void enterEmergencyMode() {
//  Serial.print("Entering emergency mode. Unlocking door.");
//  unlockDoor();
//  stateChangeTo(LockStates::EMERGENCY_UNLOCKED);
//  lockDoorTask.disable();
//  EEPROM.write(0, 1);
//  EEPROM.commit();
//}
//
//void exitEmergencyMode(unsigned long durationMillis) {
//  Serial.print("Exiting emergency mode. Locking door in ");
//  Serial.print(durationMillis);
//
//  Serial.println(" milliseconds");
//  lockDoorAfter(durationMillis);
//  stateChangeTo(LockStates::UNLOCKED_FOR_DURATION);
//  EEPROM.write(0, 0);
//  EEPROM.commit();
//}

//void loadStateFromStorage() {
//  unsigned emergencyMode = EEPROM.read(0);
//  if(emergencyMode) {
//    enterEmergencyMode();
//  } else {
//    digitalWrite(LOCK_RELAY, DOOR_LOCKED);          // HIGH=door_locked LOW=door_unlocked
//  }
//}
//
void publishStartupMessage() {
  //MQTT
  if (!client.connected()) {
    Serial.println("MQTT not connected");
    reconnect();
  }
  char buffer[150];
  snprintf(buffer, sizeof(buffer), "[" DEVICE_NAME "] (%s) startup complete. version " VERSION_STRING, WiFi.localIP().toString().c_str());
  client.publish(SEND_TOPIC, buffer);
}

void setup() {

//  EEPROM.begin(512);
  pinMode(D0, OUTPUT);
  pinMode(D1, OUTPUT);
  pinMode(D2, OUTPUT);
  pinMode(D3, OUTPUT);
  pinMode(D4, OUTPUT);
  pinMode(D5, OUTPUT);

  digitalWrite(D0, MOTOR_FORWARD_A);
  digitalWrite(D1, MOTOR_FORWARD_B);
  digitalWrite(D2, MOTOR_RIGHT_A);
  digitalWrite(D3, MOTOR_RIGHT_B);
  digitalWrite(D4, ACCEL_MOTOR_ENABLE_HIGH);
  digitalWrite(D5, TURN_MOTOR_ENABLE_HIGH);

  delay(200);
//
//  digitalWrite(D0, MOTOR_FORWARD_A);
//  digitalWrite(D1, MOTOR_FORWARD_B);
//  digitalWrite(D2, MOTOR_RIGHT_A);
//  digitalWrite(D3, MOTOR_RIGHT_B);
//  digitalWrite(D4, ACCEL_MOTOR_ENABLE_HIGH);
//  digitalWrite(D5, TURN_MOTOR_ENABLE_HIGH);
//
//  delay(200);

  Serial.begin(115200);
  setupWifi();
  setupOTA();
  client.setServer(mqttServer, 1883);
  client.setCallback(callback);

  taskRunner.init();
  taskRunner.addTask(heartBeatTask);
  heartBeatTask.enable();

//  loadStateFromStorage();
  publishStartupMessage();
}

void setupOTA() {
  // Port defaults to 8266
  ArduinoOTA.setPort(8266);

  // Hostname defaults to esp8266-[ChipID]
  ArduinoOTA.setHostname("red_remote_car_1");

  // No authentication by default
  // ArduinoOTA.setPassword("admin");

  // Password can be set with it's md5 value as well
  // MD5(admin) = 21232f297a57a5a743894a0e4a801fc3
  // ArduinoOTA.setPasswordHash("21232f297a57a5a743894a0e4a801fc3");
  ArduinoOTA.onStart([]() {
    String type;
    if (ArduinoOTA.getCommand() == U_FLASH)
      type = "sketch";
    else // U_SPIFFS
      type = "filesystem";

    // NOTE: if updating SPIFFS this would be the place to unmount SPIFFS using SPIFFS.end()
    Serial.println("[OTA] Start updating " + type);
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\n[OTA] Ota successfully completed.");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("[OTA] Progress: %u%% (%u/%u)\n", (100 * progress / total), progress, total);
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("[OTA] Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("[OTA] Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("[OTA] Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("[OTA] Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("[OTA] Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("[OTA] End Failed");
  });
  ArduinoOTA.begin();
}

void setupWifi() {

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  #ifdef USE_STATIC_IP
  IPAddress ip(STATIC_IP_ADDRESS);
  IPAddress gateway(STATIC_IP_GATEWAY);
  IPAddress subnet(STATIC_IP_SUBNET);
  WiFi.config(ip,gateway,subnet);
  #endif
  WiFi.begin(ssid, password);

  int tries = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    tries++;
    if (tries>20) {
      Serial.print("Connection failed. Rebooting...");
      ESP.restart();
    }
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect(DEVICE_NAME " CARD READER")) {
      Serial.println("connected");
      client.publish(SEND_TOPIC, "[" DEVICE_NAME "] reconnected");
      client.subscribe(RECEIVE_TOPIC);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 2 seconds");
      delay(2000);
    }
  }
}

void callback(char* topic, byte* payload, unsigned int length) {
  //handle messages

  if (*((char*)payload) == '{') {
    /* process JSON payload */
    processJsonPayload(topic, payload, length);
  } else {
    processRawPayload(topic, payload, length);
  }

}

void processRawPayload(char* topic, byte* payload, unsigned int length) {
  if (strcmp(topic, RECEIVE_TOPIC)==0) // if it is a command topic message then execute command
  {
    byte data = *payload;
    digitalWrite(D0, (data & (0x1<<5)));
    digitalWrite(D1, (data & (0x1<<4)));
    digitalWrite(D2, (data & (0x1<<3)));
    digitalWrite(D3, (data & (0x1<<2)));
    digitalWrite(D4, (data & (0x1<<1)));
    digitalWrite(D5, (data & (0x1<<0)));
  }
}

void processJsonPayload(char* topic, byte* payload, unsigned int length) {
  DynamicJsonDocument  root(200);

  deserializeJson(root, ((const char*)payload));
  const char *deviceName = root["device_name"] | "";
  const char *command = root["command"] | "";

//  if (strcmp(command, "start_emergency")==0) {
//    enterEmergencyMode();
//  }

  if (stringNotEquals(deviceName, DEVICE_NAME) && stringNotEquals(deviceName, "all")) {
    //don't process messages not intended for this node
    return;
  }

  if (strcmp(command, "restart")==0) {
    ESP.reset();
  }
}

void loop() {
  //MQTT
  if (!client.connected()) {
    Serial.println("MQTT not connected");
    stopCar();
    reconnect();
//    loadStateFromStorage();
  }
  client.loop();

  taskRunner.execute();
  ArduinoOTA.handle();
}
