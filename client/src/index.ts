import { exec } from 'child_process';
import { EasingType, NeoPixelService } from './service/NeoPixelService';
import { ServoService } from './service/ServoService';
import { SonicPiService } from './service/SonicPiService';
import { SocketService } from './service/SocketService';
import { clamp, isNaN, isNumber } from 'lodash';

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

const touchIndexToPixelIndexMap: Record<number, number> = {
  0: 0,
  1: 1,
  5: 2,
  3: 3,
  6: 4,
  2: 5,
  8: 6,
  7: 7,
}


const touchIndexToSonicMap: Record<number, string> = {
  8: 'a',
  7: 's',
  6: 'd',
  5: 'f',
  3: 'g',
  2: 'h',
  1: 'j',
  0: '0',
}

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
  // await servoService.moveAbsolutePosition(1, 1);
  // test(servoService);

  neoPixelService.onTouch((index) => {
    neoPixelService.turnOnPixel({ easingType: EasingType.EASE_OUT_QUAD, index: touchIndexToPixelIndexMap[index], rgbw: pixelColorMap[index % 8] });
    sonic.sendMessage(touchIndexToSonicMap[index]);
    socketService.sendMessage(touchIndexToPixelIndexMap[index].toString());
  });

  let prevPart = 0;
  let lastPlayTime = 0;
  neoPixelService.onLeafTouch((value) => {
    const now = Date.now();
    if (value <= 50 || !isNumber(value) || isNaN(value) || now - lastPlayTime < 500) {
      return;
    }

    const maxValue = 1000;
    const partsNum = 8;
    const partValue = maxValue / partsNum;
    const currentPart = clamp(Math.floor(value / partValue) + 1, 1, 8);

    if (prevPart !== currentPart) {
      prevPart = currentPart;
      sonic.sendMessage(currentPart);
      lastPlayTime = Date.now();
    }
  });

  socketService.onMessage((index) => {
    if (+index < 16) {
      neoPixelService.turnOnPixel({ easingType: EasingType.EASE_OUT_QUAD, index, rgbw: pixelColorMap[index % 8] });
    } else if (index === 'open') {
      servoService.gpio.servoWrite(2250);
    } else if (index === 'close') {
      servoService.gpio.servoWrite(750);
    }
  });

  Array(16)
    .fill(null)
    .forEach((_, idx) => {
      neoPixelService.turnOnPixel({ easingType: EasingType.EASE_OUT_QUAD, index: idx, rgbw: pixelColorMap[idx % 8] });
    });

  await sleep(2000);

  servoService.moveAbsolutePosition(1, 3, async () => {
    await sleep(1000);
    servoService.moveAbsolutePosition(0, 3);
  });

  // setInterval(() => {
  //   let idx = 0;
  //   const timer = setInterval(() => {
  //     neoPixelService.turnOnPixel({ easingType: EasingType.EASE_OUT_QUAD, index: idx, rgbw: pixelColorMap[idx % 8] });
  //     idx += 1;
  //     if (idx >= 16) {
  //       clearInterval(timer);
  //     }
  //   }, 200);
  // }, 2000);
};

app().catch(console.error);
