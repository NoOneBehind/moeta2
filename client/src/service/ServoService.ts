import { Gpio } from 'pigpio';
import { clamp } from 'lodash';

export class ServoService {
  private gpio: Gpio;

  private maxPulse = 2300; // 162 degree
  private minPulse = 700; // 18 degree

  private interval = 0.01;
  private _isReady = false;

  private middlePulse = 1500; // 90 degree

  private initDuration = 2;
  private currentPulseWidth = this.middlePulse;

  constructor(pinNumber: number) {
    this.gpio = new Gpio(pinNumber, { mode: Gpio.OUTPUT });
  }

  public initServoPosotion = async (): Promise<void> => {
    this.gpio.servoWrite(this.middlePulse);

    return new Promise((resolve) => {
      const iterationNum = this.initDuration / this.interval + 1;
      const pulseWidthAtOnce = (this.middlePulse - this.minPulse) / iterationNum;

      let count = 0;
      const timer = setInterval(() => {
        if (count >= iterationNum) {
          resolve();
          clearInterval(timer);
        }

        const nextPulseWidth = this.currentPulseWidth - pulseWidthAtOnce;
        this.gpio.servoWrite(Math.round(nextPulseWidth));
        count += 1;

        this.currentPulseWidth = nextPulseWidth;
      }, this.interval * 1000);
    });
  };

  public isReady = () => this._isReady;

  public moveAbsolutePosition = (position: number, duration = 0.1, cb?: () => void) => {
    if (!this.isReady) {
      throw new Error('Servo is not ready');
    }

    const targetPulseWidth = clamp(1600 * position + 700, this.minPulse, this.maxPulse);
    const pulseWidth = targetPulseWidth - this.currentPulseWidth;
    const iterationNum = duration / this.interval + 1;
    const pulseWidthAtOnce = pulseWidth / iterationNum;

    let count = 0;
    const timer = setInterval(() => {
      if (count >= iterationNum) {
        clearInterval(timer);
        cb?.();
      } else {
        const nextPulseWidth = this.currentPulseWidth + pulseWidthAtOnce;
        this.gpio.servoWrite(Math.round(nextPulseWidth));

        count += 1;
        this.currentPulseWidth = nextPulseWidth;
      }
    }, this.interval * 1000);

    return timer;
  };
}
