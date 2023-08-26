import { EasingType, NeoPixelService } from './service/NeoPixelService';
import { ServoService } from './service/ServoService';
import { SonicPiService } from './service/SonicPiService';

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

const pixelColorMap: Record<number, [number, number, number, number]> = {
  0: [255, 0, 0, 10],
  1: [0, 255, 0, 10],
  2: [0, 0, 255, 10],
  3: [255, 255, 0, 10],
  4: [255, 0, 255, 10],
  5: [0, 255, 255, 10],
  6: [12, 34, 56, 10],
  7: [78, 91, 123, 10],
};

const app = async () => {
  const neoPixelService = new NeoPixelService({ autoOpen: false, baudRate: 9600, path: '/dev/ttyACM1' });
  await neoPixelService.connect();

  neoPixelService.onTouch((index) => {
    neoPixelService.turnOnPixel({ easingType: EasingType.EASE_OUT_QUAD, index, rgbw: pixelColorMap[index] });
    sonic.sendMessage(index);
  });

  const sonic = new SonicPiService();

  // let idx = 0;
  // setInterval(() => {
  //   sonic.sendMessage(idx);
  //   idx = (idx + 1) % 8;
  // }, 2000);
};

app().catch(console.error);
