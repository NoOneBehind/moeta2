import { exec } from 'child_process';
import { EasingType, NeoPixelService } from './service/NeoPixelService';
import { ServoService } from './service/ServoService';
import { SonicPiService } from './service/SonicPiService';
import { SocketService } from './service/SocketService';

const getRandomUint8 = () => Math.round(Math.random() * 123456) % 256;
const getRandomRgbw = () =>
  Array(4)
    .fill(null)
    .map(() => getRandomUint8()) as [number, number, number, number];
const getRandomEasingType = () => {
  const enumValues = Object.values(EasingType).filter((value) => typeof value === 'number') as EasingType[];
  const randomIndex = Math.floor(Math.random() * enumValues.length);
  return enumValues[randomIndex];
};
let flag = true;
const test = (servoService: ServoService) => {
  servoService.moveAbsolutePosition(+flag, 3, () => {
    test(servoService);
    flag = !flag;
  });
};

const sleep = async (time: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });

const pixelColorMap: Record<number, [number, number, number, number]> = {
  0: [255, 102, 102, 0],
  1: [153, 204, 255, 0],
  2: [204, 153, 255, 0],
  3: [204, 255, 153, 0],
  4: [204, 204, 255, 0],
  5: [255, 153, 204, 0],
  6: [255, 255, 102, 0],
  7: [153, 255, 204, 0],
};

const app = async () => {
  const neoPixelService = new NeoPixelService({ autoOpen: false, baudRate: 9600, path: '/dev/ttyArduino' });
  const servoService = new ServoService(17);
  const socketService = new SocketService();
  await socketService.connect();
  await neoPixelService.connect();

  const sonic = new SonicPiService();
  if (process.env.NODE_ENV === 'production') {
    await sonic.init();
  }

  await servoService.initServoPosotion();
  await sleep(2000);
  // await servoService.moveAbsolutePosition(1, 1);
  // test(servoService);

  neoPixelService.onTouch((index) => {
    neoPixelService.turnOnPixel({ easingType: EasingType.EASE_OUT_QUAD, index, rgbw: pixelColorMap[index] });
    sonic.sendMessage(index);
    socketService.sendMessage(index.toString());
  });

  neoPixelService.onLeafTouch((value) => {
    console.log(value);
  });

  socketService.onMessage((index) => {
    neoPixelService.turnOnPixel({ easingType: EasingType.EASE_OUT_QUAD, index, rgbw: pixelColorMap[index % 8] });
    if (index < 8) {
      sonic.sendMessage(index);
    }
  });

  Array(16)
    .fill(null)
    .forEach((_, idx) => {
      neoPixelService.turnOnPixel({ easingType: EasingType.EASE_OUT_QUAD, index: idx, rgbw: pixelColorMap[idx % 8] });
    });

  await sleep(3000);

  servoService.moveAbsolutePosition(1, 5, async () => {
    await sleep(1000);
    servoService.moveAbsolutePosition(0, 3);
  });

  // setInterval(() => {
  // Array(16)
  //   .fill(null)
  //   .forEach((_, idx) => {
  //     neoPixelService.turnOnPixel({ easingType: EasingType.EASE_OUT_QUAD, index: idx, rgbw: pixelColorMap[idx % 8] });
  //   });
  // }, 2000);
};

app().catch(console.error);
