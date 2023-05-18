socket.on('id', (newId) => {
	if (urlParams.has('name')) {
		id = urlParams.get('name');
	}
	else {
		id = newId;
	}
	console.log('id ' + id);
});
socket.on('history', (messages) => {
	messages.forEach(msg => {
		console.log(msg.type);
		if (msg.type == 'qrcode') {
			if (msg.sender != id) {
				const li = document.createElement('li');
				li.id = 'recived';
				const recived = document.createElement('recived');
				li.appendChild(recived);
				const idField = document.createElement('id');
				idField.innerHTML = msg.sender;
				const image = document.createElement('img');
				image.src = msg.data;
				recived.appendChild(idField);
				recived.appendChild(image);
				chat.appendChild(li);
			}
			else {
				const li = document.createElement('li');
				li.id = 'sent';
				const sent = document.createElement('sent');
				li.appendChild(sent);
				const image = document.createElement('img');
				image.src = msg.data;
				sent.appendChild(image);
				chat.appendChild(li);
			}
		}
		else if (msg.type == 'image') {
			if (msg.sender != id) {
				const li = document.createElement('li');
				chat.appendChild(li);
				const image = fetch(`/getImage/${msg.name}`);
				image.then(response => response.text())
					.then(text => {
						li.id = 'recived';
						const recived = document.createElement('recived');
						li.appendChild(recived);
						const idField = document.createElement('id');
						idField.innerHTML = msg.sender;
						const img = document.createElement('img');
						img.src = text;
						recived.appendChild(idField);
						recived.appendChild(img);
					});
			}
			else {
				const image = fetch(`/getImage/${msg.name}`);
				const li = document.createElement('li');
				chat.appendChild(li);
				image.then(response => response.text())
					.then(text => {
						li.id = 'sent';
						const sent = document.createElement('sent');
						li.appendChild(sent);
						const img = document.createElement('img');
						img.src = text;
						sent.appendChild(img);
					});
			}
		}
		else {
			if (msg.sender != id) {
				const li = document.createElement('li');
				li.id = 'recived';
				const recived = document.createElement('recived');
				li.appendChild(recived);
				const idField = document.createElement('id');
				idField.innerHTML = msg.sender;
				const message = document.createElement('message');
				message.innerHTML = msg.message;
				recived.appendChild(idField);
				recived.appendChild(message);
				chat.appendChild(li);
			}
			else {
				const li = document.createElement('li');
				li.id = 'sent';
				const sent = document.createElement('sent');
				li.appendChild(sent);
				const message = document.createElement('message');
				message.innerHTML = msg.message;
				sent.appendChild(message);
				chat.appendChild(li);
			}
		}
	});
});

socket.on('message-be', (sender, msg) => {
	console.log('message server: ' + sender + ' --> ' + msg);
	const li = document.createElement('li');
	li.id = 'recived';
	const recived = document.createElement('recived');
	li.appendChild(recived);
	const idField = document.createElement('id');
	idField.innerHTML = sender;
	const message = document.createElement('message');
	message.innerHTML = msg;
	recived.appendChild(idField);
	recived.appendChild(message);
	chat.appendChild(li);
});

socket.on('qrcode-be', (sender, data) => {
	if (sender != id) {
		const li = document.createElement('li');
		li.id = 'recived';
		const recived = document.createElement('recived');
		li.appendChild(recived);
		const idField = document.createElement('id');
		idField.innerHTML = sender;
		const image = document.createElement('img');
		image.src = data;
		recived.appendChild(idField);
		recived.appendChild(image);
		chat.appendChild(li);
	}
	else {
		const li = document.createElement('li');
		li.id = 'sent';
		const sent = document.createElement('sent');
		li.appendChild(sent);
		const image = document.createElement('img');
		image.src = data;
		sent.appendChild(image);
		chat.appendChild(li);
	}
});

socket.on('imageRecived-be', (sender, name) => {
	if (sender != id) {
		let image = fetch(`/getImage/${name}`);
		image.then(response => response.text())
			.then(text => {
				const li = document.createElement('li');
				li.id = 'recived';
				const recived = document.createElement('recived');
				li.appendChild(recived);
				const idField = document.createElement('id');
				idField.innerHTML = sender;
				const image = document.createElement('img');
				image.src = text;
				recived.appendChild(idField);
				recived.appendChild(image);
				chat.appendChild(li);
			});
	}
});

socket.on('refresh', () => {
	console.log('bau bau');
	location.reload();
});