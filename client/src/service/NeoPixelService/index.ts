import { spawn } from 'child_process';
import { PortOption, SerialProtService } from '../SerialPortService';

export enum EasingType {
  EASE_OUT_QUAD,
  EASE_OUT_BOUNCE,
  EASE_IN_BOUNCE,
  EASE_IN_OUT_BOUNCE,
}

interface Command {
  easingType: EasingType;
  index: number;
  rgbw: [number, number, number, number];
}

export class NeoPixelService extends SerialProtService {
  private readonly pythonProcess;
  private touchCallback?: (index: number) => void;
  private releaseCallback?: (index: number) => void;

  constructor(portOption: PortOption) {
    super(portOption);
    this.pythonProcess = this.initializePythonProcess();
  }

  private initializePythonProcess() {
    const process = spawn('python3', ['/home/raspberrypi/works/moeta2/client/src/service/NeoPixelService/script.py']);
    process.stdout.on('data', this.handlePythonOutput);
    return process;
  }

  private handlePythonOutput = (data: Buffer): void => {
    const [indexStr, command] = data.toString().trim().split(' ');
    const index = parseInt(indexStr, 10);

    if (command === 'ON') {
      this.touchCallback?.(index);
    } else if (command === 'OFF') {
      this.releaseCallback?.(index);
    }
  };

  public turnOnPixel({ easingType, index, rgbw }: Command): Promise<void> {
    const commandString = `${index} ${EasingType[easingType]} ${rgbw.join(' ')}`;
    return this.writeData(commandString);
  }

  public onLeafTouch(callback: (value: number) => void): void {
    this.onData((data: string) => {
      const value = parseInt(data, 10);
      if (value !== 0) {
        callback(value);
      }
    });
  }

  public onTouch(callback: (index: number) => void): void {
    this.touchCallback = callback;
  }

  public onReleased(callback: (index: number) => void): void {
    this.releaseCallback = callback;
  }
}
