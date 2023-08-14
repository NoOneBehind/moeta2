import { Server } from 'socket.io';

const PORT = 3333;
const io = new Server(PORT);

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);

  socket.on('message', (data, ackCallback) => {
    ackCallback();
    console.log('Received message from', socket.id, ':', data);

    socket.broadcast.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
