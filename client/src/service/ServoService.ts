import { Gpio } from 'pigpio';
import { clamp } from 'lodash';

export class ServoService {
  private gpio: Gpio;
  private currentPulseWidth = 1500;
  private interval = 0.1;
  private _isReady = false;

  constructor(pinNumber: number) {
    this.gpio = new Gpio(pinNumber, { mode: Gpio.OUTPUT });
  }

  public initServoPosotion = async (): Promise<void> => {
    this.gpio.servoWrite(this.currentPulseWidth);

    return new Promise((resolve) => {
      const iterationNum = 3 / this.interval;
      const pulseWidthAtOnce = (this.currentPulseWidth - 500) / iterationNum;

      let count = 0;
      const timer = setInterval(() => {
        if (count >= iterationNum - 1) {
          resolve();
          clearInterval(timer);
        }

        const nextPulseWidth = this.currentPulseWidth - pulseWidthAtOnce;
        this.gpio.servoWrite(Math.floor(nextPulseWidth));
        count += 1;
        this.currentPulseWidth = nextPulseWidth;
      }, this.interval * 1000);
    });
  };

  public isReady = () => this._isReady;

  public moveAbsolutePosition = async (position: number, duration = 0.1) => {
    if (!this.isReady) {
      throw new Error('Servo is not ready');
    }

    const targetPulseWidth = clamp(15 * position + 500, 500, 2000);
    const pulseWidth = targetPulseWidth - this.currentPulseWidth;
    const iterationNum = duration / this.interval;
    const pulseWidthAtOnce = pulseWidth / iterationNum;
    const restPulseWidth = pulseWidth - pulseWidthAtOnce * iterationNum;

    let count = 0;
    const timer = setInterval(() => {
      console.log(this.currentPulseWidth);
      if (count === iterationNum - 1) {
        const nextPulseWidth = this.currentPulseWidth + restPulseWidth;
        this.gpio.servoWrite(Math.floor(nextPulseWidth));
        clearInterval(timer);
      } else {
        const nextPulseWidth = this.currentPulseWidth + pulseWidthAtOnce;
        this.gpio.servoWrite(Math.floor(nextPulseWidth));

        count += 1;
        this.currentPulseWidth = nextPulseWidth;
      }
    }, this.interval * 1000);
  };
}
