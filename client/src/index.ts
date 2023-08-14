import { SocketService } from './service/SocketService';

const socketService = new SocketService();

const app = async () => {
  socketService.onConnect(() => {
    console.log('connected');
  });

  socketService.onDisconnect(() => {
    console.log('disconnected');
  });

  await socketService.connect();

  socketService.sendMessage('Gooood');
};

app().catch(console.error);
