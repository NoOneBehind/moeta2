import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

interface PortOption {
  autoOpen?: boolean;
  path: string;
  baudRate: number;
}

export class SerialProtService {
  private port: SerialPort;
  private ACK = 'ACK';
  private commandEnter = '\n';
  private encoding: BufferEncoding = 'utf8';

  public parser: ReadlineParser;

  constructor(portOption: PortOption) {
    const { autoOpen = false, baudRate, path } = portOption;
    this.port = new SerialPort({ autoOpen, baudRate, path });
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n', encoding: this.encoding }));
  }

  public connect = async () => {
    if (this.port.isOpen) {
      console.log('Port is already open');
      return;
    }

    return new Promise((resolve, reject) => {
      this.port.open((err) => {
        if (err) {
          console.error('Error opening port:', err.message);
          reject(err);
        } else {
          console.log('Port opened successfully');
          resolve(true);
        }
      });
    });
  };

  public readData = () =>
    new Promise((resolve) => {
      this.parser.once('data', (data) =>
        resolve(
          Buffer.from(data)
            .filter((byte) => byte !== 0x00)
            .toString(),
        ),
      );
    });

  public writeData = async (data: string): Promise<void> => {
    if (!this.port.isOpen) {
      throw new Error('not opened');
    }

    const buffer = Buffer.isBuffer(data)
      ? Buffer.concat([data, Buffer.from(this.commandEnter, this.encoding)])
      : Buffer.from(`${data}${this.commandEnter}`, this.encoding);
    this.port.write(buffer);

    return new Promise((resolve) => {
      this.readData().then((response) => {
        if (response === this.ACK) {
          resolve();
        }
      });
    });
  };
}
