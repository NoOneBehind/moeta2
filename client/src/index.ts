import { EasingType, NeoPixelService } from './service/NeoPixelService';
import { ServoService } from './service/ServoService';
import { spawn } from 'child_process';

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
    servoService.moveAbsolutePosition(+!flag, 3, () => {
      test();
      flag = !flag;
    });

  const neoService = new NeoPixelService({ autoOpen: false, path: '/dev/ttyACM0', baudRate: 9600 });
  await neoService.connect();

  let index = 0;
  setInterval(() => {
    neoService.turnOnPixel({ easingType: 0, index, rgbw: [123, 12, 200, 20] });
    index = (index + 1) % 8;
  }, 500);

  const pythonProcess = spawn('python3', ['/home/raspberrypi/works/moeta2/client/src/service/TouchService/script.py']);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python Output: ${data.toString()}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data.toString()}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python process closed with code: ${code}`);
  });

  pythonProcess.on('exit', (code) => {
    console.log(`Python process exited with code: ${code}`);
  });
};

app().catch(console.error);
