import { Gpio } from 'pigpio';
import { clamp } from 'lodash';

export class ServoService {
  private gpio: Gpio;
  private currentPulseWidth = 0;
  private interval = 0.1;

  constructor(pinNumber: number) {
    this.gpio = new Gpio(pinNumber, { mode: Gpio.OUTPUT });
  }

  public moveAbsolutePosition = (position: number, duration = 0.1) => {
    const targetPulseWidth = clamp(15 * position + 500, 500, 2000);
    const pulseWidth = targetPulseWidth - this.currentPulseWidth;
    const iterationNum = duration / this.interval;
    const pulseWidthAtOnce = pulseWidth / iterationNum;
    const restPulseWidth = pulseWidth - pulseWidthAtOnce * iterationNum;

    let count = 0;
    const timer = setInterval(() => {
      if (count === iterationNum - 1) {
        const nextPulseWidth = this.currentPulseWidth + restPulseWidth;
        this.gpio.servoWrite(nextPulseWidth);
        clearInterval(timer);
      } else {
        const nextPulseWidth = this.currentPulseWidth + pulseWidthAtOnce;
        this.gpio.servoWrite(nextPulseWidth);

        count += 1;
        this.currentPulseWidth = nextPulseWidth;
      }
    }, this.interval);
  };
}
