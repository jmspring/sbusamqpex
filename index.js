var nodeQpid = require('qpid'),
    minimist = require('minimist');
var Messenger = nodeQpid.proton.Messenger;
  
function print_usage() {
  console.log(process.argv[0] + " [-r/-s] -n <namespace> -q <queue name> -u <access name> -k <access key> [ -m <message (if send)> ]")
  process.exit(1);
}
    
var argv = minimist(process.argv.slice(2));
if( ('s' in argv && 'r' in argv) || !('s' in argv || 'r' in argv) ||
    (!('n' in argv) || !('q' in argv) || !('u' in argv) || !('k' in argv)) ||
    (('s' in argv) && !('m' in argv)) ) {
  print_usage();
}

var isSend = false;
var ns = argv['n'] + ".servicebus.windows.net";
var queue = argv['q'];
var name = argv['u'];
var key = argv['k'];
var message = null;
if('s' in argv) {
  isSend = true;
  message = argv['m'];
}

var address = "amqps://" + encodeURIComponent(name) + ":" + encodeURIComponent(key) + "@" + ns + "/" + queue;
console.log("Connecting to: " + address);
var m = new Messenger();
m.on('error', function(err) {
  console.log("Error: " + err.message);
});

if(isSend) {
  m.send({address: address, body: message}, function(err) {
    if (err) {
      console.log("Error sending message: " + err.message);
    }
  });
} else {
  m.on('subscribed', function(url) {
    console.log("Subscribed to " + url);
  });
  m.on('message', function(message) {
    console.log(message.body);
  });
  m.subscribe(address).receive();
}