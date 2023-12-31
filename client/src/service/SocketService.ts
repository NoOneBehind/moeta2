import { io } from 'socket.io-client';

import { SERVER_URL } from '../const';

export class SocketService {
  private socket: ReturnType<typeof io>;
  private timeout = 2000;

  constructor() {
    this.socket = io(SERVER_URL, { autoConnect: false });
  }

  public connect = (): Promise<void> =>
    new Promise((resolve) => {
      if (this.socket.connected) {
        return resolve();
      }

      this.socket.once('connect', resolve);
      this.socket.connect();
    });

  public onConnect = (callback: () => void) => {
    if (this.socket.connected) {
      return;
    }

    this.socket.on('connect', callback);
  };

  public onDisconnect = (callback: () => void) => {
    if (!this.socket.connected) {
      return;
    }

    this.socket.on('disconnect', callback);
  };

  public sendMessage = async (message: string) => {
    try {
      await this.socket.timeout(this.timeout).emitWithAck('message', message);
    } catch (error) {
      console.error(error);
      // throw error;
    }
  };

  public onMessage(callback: (message: any) => void): void {
    this.socket.on('message', callback);
  }

  public setTimeout = (timeout: number) => {
    this.timeout = timeout;
  };
}
