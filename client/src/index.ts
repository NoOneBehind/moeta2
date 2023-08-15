import { SocketService } from './service/SocketService';
import { SonicPiService } from './service/SonicPiService';

const socketService = new SocketService();

const app = async () => {
  // socketService.onConnect(() => {
  //   console.log('connected');
  // });

  // socketService.onDisconnect(() => {
  //   console.log('disconnected');
  // });

  // await socketService.connect();

  // socketService.sendMessage('Gooood');
  new SonicPiService().sendMessage('1234');
};

app().catch(console.error);
