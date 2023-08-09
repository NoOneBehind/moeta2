import { io } from 'socket.io-client';

const PORT = 3333;

const SERVER_URL = `http://localhost:${PORT}`;

const socket = io(SERVER_URL);

socket.on('connect', () => {
  console.log(`ID: ${socket.id}`);
  console.log('Connected to server:', SERVER_URL);

  socket.emit('message', `Hello from client ${socket.id}`);
});

socket.on('message', (data) => {
  console.log('Received message:', data);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
