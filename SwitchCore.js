var path = require('path');
var fs = require('fs');
var storage = require('node-persist');
var uuid = require('./').uuid;
var Accessory = require('./').Accessory;
var accessoryLoader = require('./lib/AccessoryLoader');
var io = require('socket.io').listen(3000);

// Initialize our storage system
storage.initSync();

// Our Accessories will each have their own HAP server; we will assign ports sequentially
var targetPort = 51826;

// Set up the switch HAP profile
var hapswitch_config = require('./hap-switch.js').hapswitch;
var hapswitch = accessoryLoader.parseAccessoryJSON(hapswitch_config);

io.sockets.on('connection', function (socket) {
  var power_characteristic = hapswitch.services[1].characteristics[1];

  function isPowerCharacteristic(element) {
    element.displayName === 'The state of the stream';
  }

  socket.on('on', function(data){
    console.log("Ensuring state is on");
    power_characteristic.setValue(true);
    socket.send("on");
  });

  socket.on('off', function(data){
    console.log('Ensuring state is off');
    power_characteristic.setValue(false);
    socket.send('off');
  });
});

// publish this Accessory on the local network
hapswitch.publish({
  port: targetPort,
  username: hapswitch.username,
  pincode: hapswitch.pincode
});
