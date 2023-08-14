import { io } from 'socket.io-client';

import { SERVER_URL } from '../const';

export class SocketService {
  public socket: ReturnType<typeof io>;
  private timeout = 2000;

  constructor() {
    this.socket = io(SERVER_URL, { autoConnect: false });
  }

  public connect = (): Promise<void> => {
    return new Promise((resolve) => {
      if (this.socket.connected) {
        return resolve();
      }

      this.socket.once('connect', resolve);
      this.socket.connect();
    });
  };

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

  public setTimeout = (timeout: number) => {
    this.timeout = timeout;
  };
}
