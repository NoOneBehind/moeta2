import { ServoService } from './service/ServoService';

const app = async () => {
  const servoService = new ServoService(17);

  await servoService.initServoPosotion();
  servoService.moveAbsolutePosition(1, 0.5, () => {
    servoService.moveAbsolutePosition(0, 0.5, () => {
      servoService.moveAbsolutePosition(1, 0.5);
    });
  });
};

app().catch(console.error);
