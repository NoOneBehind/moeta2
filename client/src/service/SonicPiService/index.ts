import { Client } from 'node-osc';
import { SONIC_PI_PORT } from '../../const';
import { exec } from 'child_process';

export class SonicPiService {
  private client: Client;

  constructor() {
    this.client = new Client('127.0.0.1', SONIC_PI_PORT);
  }

  public init = async () =>
    new Promise((resolve) => {
      setTimeout(() => {
        exec(
          'cat /home/raspberrypi/works/moeta2/client/src/service/SonicPiService/init.rb | sonic_pi',
          (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              return;
            }
            console.log(`stdout: ${stdout}`);
            console.error(`stderr: ${stderr}`);
          },
        );
        resolve(null);
      }, 20000);
    });

  public sendMessage = async (message: string | number) => {
    this.client.send('/run_code', [`${message}`], () => {});
  };
}
