import { Client } from 'node-osc';
import { SONIC_PI_PORT } from '../const';

export class SonicPiService {
  private client: Client;

  constructor() {
    this.client = new Client('127.0.0.1', SONIC_PI_PORT);
  }

  public sendMessage = async (message: string | number) => {
    this.client.send('/run_code', [`${message}`], console.error);
  };
}
