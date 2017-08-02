var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/views/index.html');
});

var users = {};

io.on('connection', function(socket) {
	console.log('a socket is connecting...');

	// 用户登录
	socket.on('user-login', function(data, callback){
		var username = data.username;
		if(users.hasOwnProperty(username)){
			callback(false);
		}else {
			socket.username = username;
			users[username] = data;
			console.log('user ' + username + ' has login');
			io.emit('user-login-prompt', data);
			io.emit('update-online-users', users);
			callback(true);
		}
	});

	// 用户退出登录
	socket.on('disconnect', function(reason){
		if(users.hasOwnProperty(socket.username)) { // 用户已经登录
			var logouttime = new Date();
			logouttime = logouttime.getFullYear().toString() + '/' + (logouttime.getMonth() + 1).toString() + '/' + logouttime.getDate().toString() + ' '
			 + logouttime.getHours().toString() + ':' + logouttime.getMinutes().toString() + ':' + logouttime.getSeconds().toString();
			delete users[socket.username];
			console.log('user ' + socket.username + ' has logout'); 
			io.emit('user-logout-prompt', {username:socket.username, logouttime:logouttime});
			io.emit('update-online-users', users);
		}
	});

	// 用户发送消息
	socket.on('send-message', function(data){
		console.log(data.username + ' send a message: ' + data.message + ' at time: ' + data.sendtime);
		io.emit('display-message', data);
	});
});

server.listen(process.env.PORT || 3000, function(){
	console.log('Server runnint at', process.env.PORT || 3000);
});
