import time
import board
import busio
import sys
import adafruit_mpr121

def initialize_mpr121(i2c, threshold=40):
    """Initialize MPR121 with given threshold for all pins."""
    mpr121 = adafruit_mpr121.MPR121(i2c)
    
    for i in range(12):  # there are 12 pins on MPR121
        mpr121[i].threshold = threshold

    return mpr121

def main():
    # Set up the I2C bus.
    i2c = busio.I2C(board.SCL, board.SDA)
    
    # Initialize the MPR121 sensor.
    mpr121 = initialize_mpr121(i2c)
    
    last_touched = mpr121.touched_pins

    while True:
        current_touched = mpr121.touched_pins

        # Iterate over each pin to detect touch and release.
        for i, pin in enumerate(current_touched):
            if pin and not last_touched[i]:
                print(f"{i} ON")
                sys.stdout.flush()
            elif not pin and last_touched[i]:
                print(f"{i} OFF")
                sys.stdout.flush()
        
        # Store the current state to compare in the next loop.
        last_touched = current_touched

if __name__ == "__main__":
    main()
