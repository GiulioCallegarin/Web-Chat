const socket = io();
const chat = document.getElementById('chatUl');
const form = document.getElementById('inputForm');
const input = document.getElementById('text');
const imageInput = document.getElementById('imageInput');
const urlParams = new URLSearchParams(window.location.search);
let id;