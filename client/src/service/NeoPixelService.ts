import { SerialProtService } from './SerialPortService';

interface Command {
  command: 'ON' | 'OFF';
  neoPixelNumber: number;
  rgb: [number, number, number];
}

export class NeoPixelService extends SerialProtService {
  public handleNeoPixel = async (commands: Command[]) => {
    const commandString = commands.reduce((acc, { command, neoPixelNumber, rgb }) => {
      const commandString = `${neoPixelNumber} ${command} ${rgb.join(' ')}`;

      return acc ? `${acc} ${commandString}` : commandString;
    }, '');

    return this.writeData(commandString);
  };
}
