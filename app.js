var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

// connection event handler
// connection이 수립되면 event handler function의 인자로 socket이 들어온다
io.on('connection', (socket) => {
    // 접속한 클라이언트의 정보가 수신되면
    socket.on('login', (data) => {
        console.log('Client logged-in:\n name:' + data.name + '\n userid: ' + data.userid);

        // socket에 클라이언트 정보를 저장한다
        socket.name = data.name;
        socket.userid = data.userid;

        // 접속된 모든 클라이언트에게 메시지를 전송한다
        io.emit('login', data.name);
    });

    // 클라이언트로부터의 메시지가 수신되면
    socket.on('chat', (data) => {
        console.log('Message from %s: %s', socket.name, data.msg);

        var msg = {
            from: {
                name: socket.name,
                userId: socket.userid,
            },
            msg: data.msg,
        };

        // 메시지를 전송한 클라이언트를 제외한 모든 클라이언트에게 메시지를 전송한다
        socket.broadcast.emit('chat', msg);
    });

    socket.on('forceDisconnect', () => {
        socket.disconnect();
    });

    socket.on('disconnect', () => {
        console.log('user disconnected' + socket.name);
    });
});




app.listen(3000, function () {
    console.log('Socket IO server listening on port 3000');
});

module.exports = app;
