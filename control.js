const mqtt = require('mqtt');
const ioHook = require('iohook');
const readline = require('readline');

const client = mqtt.connect('mqtt://localhost:1883');

const remoteCarTopic = 'devices/red_remote_car_1/commands';

var a;

client.on('connect', () => {
    console.log('Mqtt connected');
    const topic = '#';
    client.subscribe(topic, (err) => {
        if (err) {
            console.log(`Error while subscribing to '${topic}'`, err);
            return;
        }
        console.log(`Subscribe successful to topic '${topic}'`);
    });


    // a = remoteCarControlCommand(0,0,1,1,1,1);
    // console.log("message: ", a);
    // publishByte(client, 'test', a);

});

client.on('message', function (topic, message) {
  // message is Buffer
  console.log(`"${topic}": [${message[0]}] "${message.toString()}"`);
});


readline.emitKeypressEvents(process.stdin);

process.stdin.resume();

let keyState = {
    'up':{},
    'down':{},
    'left':{},
    'right':{},
};

process.stdin.on('keypress', (ch, key) => {
    // console.log('got "keypress"', ch, key);
    if (key && key.ctrl && key.name == 'c') {
        process.stdin.setRawMode(false);
        process.kill( process.pid, 'SIGTERM' )
    }

    try {

    switch(key.name) {
        case 'up':
        case 'w':
        console.log("up");
        keydown(keyState, 'up');
        break;

        case 'down':
        case 's':
        console.log("down");
        keydown(keyState, 'down');
        break;

        case 'right':
        case 'd':
        console.log("right");
        keydown(keyState, 'right');
        break;

        case 'left':
        case 'a':
        console.log("left");
        keydown(keyState, 'left');
        break;
    }
    handleInput(keyState);
} catch(e) {
    console.log(e)
}
});

process.stdin.setRawMode(true);

function handleInput(keyState) {
    let state = {};
    if (keyState['up'].pressed) state['up'] = true;
    if (keyState['down'].pressed) state['down'] = true;
    if (keyState['left'].pressed) state['left'] = true;
    if (keyState['right'].pressed) state['right'] = true;

    if (JSON.stringify(state) == JSON.stringify({})) {
        // freewheel(); // or stop
        stopCar();
    }

    if (JSON.stringify(state) == JSON.stringify({up:true})) {
        moveForward();
    }
    if (JSON.stringify(state) == JSON.stringify({down:true})) {
        moveBackward();
    }
    if (JSON.stringify(state) == JSON.stringify({left:true})) {
        turnLeft();
    }
    if (JSON.stringify(state) == JSON.stringify({right:true})) {
        turnRight();
    }
    if (JSON.stringify(state) == JSON.stringify({up:true, left:true})) {
        turnLeftAccelerate();
    }
    if (JSON.stringify(state) == JSON.stringify({up:true, right:true})) {
        turnRightAccelerate();
    }
}

function moveForward() {
    // publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,1,0,1,0));
    // publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,1,1,1,0));
    publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,1,0,1,1));
    // publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,1,1,1,1));
}

function moveBackward() {
    publishByte(client, remoteCarTopic, remoteCarControlCommand(1,0,0,0,1,1));
}

function turnLeft() {
    publishByte(client, remoteCarTopic, remoteCarControlCommand(1,1,1,0,1,1));
}

function turnRight() {
    publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,0,1,1,1));
}

function turnLeftAccelerate() {
    publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,1,0,1,1));
}

function turnRightAccelerate() {
    publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,0,1,1,1));
}

function stopCar() {
    publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,0,0,1,1));
}

function keydown(keyState, key) {
    console.log(keyState)
    if (keyState[key].pressed) {
        clearTimeout(keyState[key].timer);
    }
    keyState[key] = {
        pressed: true,
        timer: setTimeout(() => {
            keyState[key].pressed = false;
            handleInput(keyState);
        }, 200),
    };
}


function remoteCarControlCommand(accelMotorNegative, accelMotorPositive, turnMotorLeftPositive, turnMotorLeftNegative, accelMotorEnable, turnMotorEnable) {
    let a = accelMotorNegative;
    let b = accelMotorPositive;
    let c = turnMotorLeftPositive;
    let d = turnMotorLeftNegative;
    let e = accelMotorEnable;
    let f = turnMotorEnable;
    return (a && (0x1<<5)) | 
    (b && (0x1<<4)) | 
    (c && (0x1<<3)) | 
    (d && (0x1<<2)) | 
    (e && (0x1<<1)) | 
    (f && (0x1<<0)) | 0;
}

function publishByte(client, topic, message) {
    client.publish(topic, Buffer.from([message]));
}
// testTruthTable()
function testTruthTable() {
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,0,0,0,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,0,0,0,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,0,0,1,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,0,0,1,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,0,1,0,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,0,1,0,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,0,1,1,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,0,1,1,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,1,0,0,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,1,0,0,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,1,0,1,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,1,0,1,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,1,1,0,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,1,1,0,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,1,1,1,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,0,1,1,1,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,0,0,0,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,0,0,0,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,0,0,1,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,0,0,1,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,0,1,0,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,0,1,0,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,0,1,1,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,0,1,1,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,1,0,0,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,1,0,0,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,1,0,1,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,1,0,1,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,1,1,0,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,1,1,0,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,1,1,1,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(0,1,1,1,1,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,0,0,0,0,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,0,0,0,0,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,0,0,0,1,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,0,0,0,1,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,0,0,1,0,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,0,0,1,0,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,0,0,1,1,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,0,0,1,1,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,0,1,0,0,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,0,1,0,0,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,0,1,0,1,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,0,1,0,1,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,0,1,1,0,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,0,1,1,0,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,0,1,1,1,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,0,1,1,1,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,1,0,0,0,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,1,0,0,0,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,1,0,0,1,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,1,0,0,1,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,1,0,1,0,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,1,0,1,0,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,1,0,1,1,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,1,0,1,1,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,1,1,0,0,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,1,1,0,0,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,1,1,0,1,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,1,1,0,1,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,1,1,1,0,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,1,1,1,0,1));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,1,1,1,1,0));
    setTimeout(()=>{
        publishByte(client, remoteCarTopic, remoteCarControlCommand(1,1,1,1,1,1));
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
    }, 1500);
}

