import { ServoService } from './service/ServoService';

const app = async () => {
  const servoService = new ServoService(17);

  await servoService.initServoPosotion();
  servoService.moveAbsolutePosition(100, 3);
};

app().catch(console.error);
