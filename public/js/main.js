$(function(){
	var socket = io('http://localhost:3000');
	var username;

	var $loginForm = $('#loginForm');
	var $content = $('#content');
	var $messageForm = $('#messageForm');

	// 登录
	$loginForm.submit(function(e) {
		e.preventDefault();
		var $username = $.trim($('#username').val());
		var $loginWarning = $('#loginWarning');
		if($username === '') {
			$loginWarning.html('昵称不能为空').show();
			return;
		}else {
			var logintime = new Date();
			logintime = logintime.getFullYear().toString() + '/' + (logintime.getMonth() + 1).toString() + '/' + logintime.getDate().toString() + ' '
			 + logintime.getHours().toString() + ':' + logintime.getMinutes().toString() + ':' + logintime.getSeconds().toString();
			socket.emit('user-login', {username: $username, logintime: logintime}, function(success){
				if(success){
					username = $username;
					$loginForm.hide();
					$content.show();
				}else{
					$loginWarning.html('昵称' + $username + '已经被使用，请选择其他昵称').show();
				}
				$('#username').val('');
			});
		}
	});

	// 发送消息
	$messageForm.submit(function(e) {
		e.preventDefault();
		var message = $('#message').val().trim();
		if(message === '') {
			return;
		}else{
			var sendtime = new Date();
			sendtime = sendtime.getFullYear().toString() + '/' + (sendtime.getMonth() + 1).toString() + '/' + sendtime.getDate().toString() + ' '
			 + sendtime.getHours().toString() + ':' + sendtime.getMinutes().toString() + ':' + sendtime.getSeconds().toString();
			socket.emit('send-message', {
				username: username,
				sendtime: sendtime,
				message: message
			});
			$('#message').val('');
		}
	});

	// 更新在线用户列表
	socket.on('update-online-users', function(users){
		var html = '';
		for(var username in users){
			var user = users[username];
			html += '<li class="list-group-item"><strong>' + user.username + '</strong><span> (登录于:' + user.logintime + ')</span></li>';
		}
		$('#onlineUsers').html(html);	
	});

	// 用户上线提示
	socket.on('user-login-prompt', function(user) {
		var html = '<div class="col-md-offset-3 col-md-6"><p class="text-primary text-center">' + user.username + ' 上线(' + user.logintime + ')' +'</p></div>';
		$('#messagePanel div.panel-body').append(html);
	});

	// 用户下线提示
	socket.on('user-logout-prompt', function(user) {
		var html = '<div class="col-md-offset-3 col-md-6"><p class="text-danger text-center">' + user.username + ' 下线(' + user.logouttime + ')' +'</p></div>';
		$('#messagePanel div.panel-body').append(html);
	});

	// 显示消息
	socket.on('display-message', function(data) {
		var isme = data.username === username;
		var html;
		if(isme) {
			html = '<div class="row"><div class="col-md-offset-6 col-md-6"><div class="well"><p class="text-info">' + data.message +'</p></div></div></div>'
		} else {
			html = '<div class="row"><div class="col-md-6"><div class="well"><p class="text-danger"><strong>' + data.username + ' (' + data.sendtime
			 +')</strong></p><p class="text-success">' + data.message + '</p></div></div></div>'
		}
		$('#messagePanel div.panel-body').append(html);
	});
});