import { SerialProtService } from './service/SerialPortService';
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
  // new SonicPiService().sendMessage('1234');

  const serialPort = new SerialProtService({ path: '/dev/ttyACM0', baudRate: 9600 });

  await serialPort.connect();

  setTimeout(async () => {
    await serialPort.writeData('ha');
    console.log('ㅜㅜ');
  }, 3000);
};

app().catch(console.error);
