import { SerialProtService } from './SerialPortService';

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
  public turnOnPixel = async ({ easingType, index, rgbw }: Command) => {
    const commandString = `${index} ${easingType} ${rgbw.join(' ')}`;

    return this.writeData(commandString);
  };
}
