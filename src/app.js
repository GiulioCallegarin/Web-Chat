const express = require('express');
const http = require('http');
const sqlite3 = require('sqlite3').verbose();
const { Server } = require("socket.io");
const qrcode = require('qrcode');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const db = new sqlite3.Database('src/db/messages.db')

app.use(express.json());
app.use(express.static('public'));

const port = 3005;
const hostname = '127.0.0.1';

let messages = [];
let images = [];
let idCounter = 1;

db.serialize(() => {
	db.all('SELECT id, sender, type, text, data FROM history', (err, rows) => {
		rows.forEach(row => {
			if (row.type == 'message')
				messages.push({ 'sender': row.sender, 'type': 'message', 'message': row.text });
			else if (row.type == 'qrcode')
				messages.push({ 'sender': row.sender, 'type': 'qrcode', 'data': row.data });
			else if (row.type == 'image') {
				messages.push({ 'sender': row.sender, 'type': 'image', 'name': row.id });
				images.push({ 'name': row.id, 'data': row.data });
			}
		});
	});
});

io.on('connection', (socket) => {

	console.log('connected: ' + idCounter);
	socket.emit('id', `Mona ${idCounter}`);
	socket.emit('history', messages);
	idCounter++;

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

	socket.on('message-fe', (sender, msg) => {
		console.log('message: ' + sender + ' --> ' + msg);
		socket.broadcast.emit('message-be', sender, msg);
		messages.push({ 'sender': sender, 'type': 'message', 'message': msg });
		db.serialize(() => {
			db.run('INSERT INTO history (sender, type, text) VALUES ($sender, $type, $text)', { $sender: sender, $type: 'message', $text: msg });
		});
	});

	socket.on('qrcode-fe', (sender, text) => {
		qrcode.toDataURL(text, function (err, url) {
			console.log('qrcode: ' + sender + ' --> ' + url);
			socket.broadcast.emit('qrcode-be', sender, url);
			socket.emit('qrcode-be', sender, url);
			messages.push({ 'sender': sender, 'type': 'qrcode', 'data': url });
			db.serialize(() => {
				db.run('INSERT INTO history (sender, type, data) VALUES ($sender, $type, $data)', { $sender: sender, $type: 'qrcode', $data: url });
			});
		});
	});

	app.post('/uploadImage/:sender', (req, res) => {
		let file = req.body.myFile;
		let name = `${Date.now()}.${req.body.extension}`;
		console.log('image: ' + req.params.sender + ' --> ' + name);
		messages.push({ 'sender': req.params.sender, 'type': 'image', 'name': name });
		images.push({ 'name': name, 'data': file });
		db.serialize(() => {
			db.run('INSERT INTO history (sender, type, data) VALUES ($sender, $type, $data)', { $sender: req.params.sender, $type: 'image', $data: file });
		});
		socket.broadcast.emit('imageRecived-be', req.params.sender, name);
	});

	app.get('/db/delete', (req, res) => {
		db.serialize(() => {
			db.run('DELETE FROM history');
		});
		messages = [];
		images = [];
		socket.broadcast.emit('refresh');
		res.send('deleted history');
	});

	app.get('/getImage/:name', (req, res) => {
		let found = false;
		console.log('sending ' + req.params.name);
		images.forEach(element => {
			if (element.name == req.params.name) {
				found = true;
				res.send(element.data);
				return;
			}
		});
		if (!found) {
			res.send('loading error');
		}
	});
});



server.listen(port, hostname, () => {
	console.log(`Server in ascolto su http://${hostname}:${port}`)
})
