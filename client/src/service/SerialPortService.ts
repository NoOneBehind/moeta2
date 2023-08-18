import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

export class SerialProtService {
  private port: SerialPort;
  private parser: ReadlineParser;

  constructor(port: { autoOpen: boolean; path: string; baudRate: number }) {
    this.port = new SerialPort(port);
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\r\n' }));
  }

  public connect = () => {
    if (this.port.isOpen) {
      console.log('Port is already open');
      return;
    }

    this.port.open();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public onceData = (callback: (chunk: any) => void) => {
    this.parser.once('data', callback);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public writeData = (data: any) => {
    this.port.write(data, (err) => {
      if (err) {
        return console.log('Error writing data: ', err.message);
      }
    });
  };

  // closeConnection(callback) {
  //   this.port.close(callback);
  // }
}
