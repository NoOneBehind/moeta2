import http from 'http';
import { Server, ServerOptions } from 'socket.io';

class SocketService {
  private server: http.Server;
  private io: Server;

  constructor(serverOption: Partial<ServerOptions> = { cors: { origin: '*' } }) {
    this.server = http.createServer();
    this.io = new Server(this.server, serverOption);
  }

  start(port = 3000) {
    this.io.on('connection', (socket) => {
      console.log('a user connected');

      socket.on('message', (message) => {
        console.log('Message from client:', message);
      });

      socket.on('disconnect', () => {
        console.log('user disconnected');
      });

      socket.emit('message', 'Welcome to the server!');
    });

    this.server.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`);
    });
  }

  stop() {
    this.server.close(() => {
      console.log('Server stopped');
    });
  }
}

module.exports = SocketService;
