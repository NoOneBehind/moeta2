import { SerialProtService } from './SerialPortService';

interface Command {
  command: 'ON' | 'OFF';
  neoPixelNumber: number;
  rgb: [number, number, number];
}

export class NeoPixelService {
  constructor(private readonly serialPortService: SerialProtService) {}

  public connect = async () => this.serialPortService.connect();

  public handleNeoPixel = async (commands: Command[]) => {
    const commandString = commands.reduce((acc, { command, neoPixelNumber, rgb }) => {
      const commandString = `${neoPixelNumber} ${command} ${rgb.join(' ')}`;

      return `${acc} ${commandString}`;
    }, '');

    return this.serialPortService.writeData(commandString);
  };
}
