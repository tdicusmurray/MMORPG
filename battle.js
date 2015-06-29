var fs = require('fs');

var cfg = {
    ssl: true,
    port: 1337,

    ssl_key: '/home/teddy/workfar.com.key',
    ssl_cert: '/home/teddy/workfar.com.crt'

};

var httpServ = require('https');
var WebSocketServer   = require('ws').Server;

var app      = null;
app = httpServ.createServer({
    // providing server with  SSL key/cert
    key: fs.readFileSync( cfg.ssl_key ),
    cert: fs.readFileSync( cfg.ssl_cert )

}, function() { } ).listen( cfg.port ); 
var wss = new WebSocketServer({ server: app });

var players = [];
wss.on('connection', function connection(ws) {
	players.push(ws);
	players.forEach(function(player) {
		player.send(JSON.stringify({ command: "new", id: ws._ultron.id }));
		ws.send(JSON.stringify({ command: "new", id: player._ultron.id }));
	});
	ws.on('message', function incoming(message) {
		var message = JSON.parse(message);
		var id = ws._ultron.id;
		if (message.command == "chat") {
			players.forEach(function(player) {
			    	player.send(JSON.stringify({ command: "chat", message: message.message  })); 
			});
		} else {
			players.forEach(function(player) {
				if (player != ws)
			    	player.send(JSON.stringify({ command: "move", id: id, x: message.x, y: message.y, animationFrame: message.animationFrame, direction: message.direction  })); 
			});
		}
	});
	ws.on('close', function close() {
		var index = players.indexOf(this);
		players.splice(index,1);
	    players.forEach(function(player) {
			player.send(JSON.stringify({ command: "gone", id: ws._ultron.id }));
		});
	});
}); 