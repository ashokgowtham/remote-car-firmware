Dev environment
===============

To install dependencies
```bash
pio lib install "arkhipenko/TaskScheduler"
pio lib install "knolleary/PubSubClient"
pio lib install "bblanchon/ArduinoJson"
```

######When compiling the code,

Remember to fill in the wifi SSID and password in the `src/RemoteCar.ino`
Basically look for the following and update accordingly.
```cpp
const char* ssid = FILL_IN_SSID_STRING;
const char* password = FILL_IN_PASSWORD_STRING;
```

####General PlatformIO Commands

Access device serial console:
```
pio device monitor
````

Compile and upload firmware to device.
```bash
pio run --target=upload
```

Just compile firmware but not upload
```bash
pio run
```

