import { EasingType, NeoPixelService } from './service/NeoPixelService';
import { ServoService } from './service/ServoService';

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

const app = async () => {
  const servoService = new ServoService(17);
  let flag = true;

  const test = () =>
    servoService.moveAbsolutePosition(+!flag, 0.5, () => {
      test();
      flag = !flag;
    });

  const neoService = new NeoPixelService({ autoOpen: false, path: '/dev/ttyACM0', baudRate: 9600 });
  await neoService.connect();

  await servoService.initServoPosotion();
  test();

  let index = 0;
  setInterval(() => {
    neoService.turnOnPixel({ easingType: 0, index, rgbw: getRandomRgbw() });
    index = (index + 1) % 12;
  }, 400);

  // neoService.onTouch((index) => {
  //   neoService.turnOnPixel({ easingType: 0, index, rgbw: [255,0,0,0] });
  // })
};

app().catch(console.error);
