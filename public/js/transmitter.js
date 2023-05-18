form.addEventListener('submit', (e) => {
	e.preventDefault()

	if (input.value) {
		console.log(input.value);
		if (input.value.startsWith('/qrcode')) {
			socket.emit('qrcode-fe', id, input.value.replace('\/qrcode ', ''));
			console.log('qrcode bello');
		}
		else {
			socket.emit('message-fe', id, input.value)
			const li = document.createElement('li');
			li.id = 'sent';
			const sent = document.createElement('sent');
			li.appendChild(sent);
			const message = document.createElement('message');
			message.innerHTML = input.value;
			sent.appendChild(message);
			chat.appendChild(li);
		}
		input.value = '';
	}
});

imageInput.addEventListener('click', (e) => {
	e.preventDefault();
});
imageInput.addEventListener("change", () => {
	const files = imageInput.files;
	for (let i = 0; i < files.length; i++) {
		if (files[i].type.match("image")) {
			const reader = new FileReader();
			let file;
			reader.onloadend = () => {
				file = reader.result;
				console.log(file);
				const li = document.createElement('li');
				li.id = 'sent';
				const sent = document.createElement('sent');
				li.appendChild(sent);
				const img = document.createElement('img');
				img.src = file;
				sent.appendChild(img);
				chat.appendChild(li);

				fetch(`/uploadImage/${id}`, {
					method: "POST",
					headers: {
						'Content-Type': 'application/json',
						'Accept': 'application/json'

					},
					body: JSON.stringify({
						myFile: file,
						extension: files[i].name.split('.').pop()
					}),
				});
			}
			reader.readAsDataURL(files[i]);
		}
	}
});