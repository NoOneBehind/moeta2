#include <Arduino.h>
#include <Adafruit_NeoPixel.h>

#define LED_PIN 7       // Neopixel D Pin
#define LED_COUNT 8     // Number of Neopixel LEDs
#define BRIGHTNESS 100  // Neopixel brightness (0 ~ 255)

Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRBW + NEO_KHZ800);

void setup() {
  strip.begin();                    
  strip.setBrightness(BRIGHTNESS);  
  strip.show();
}

void loop() {
  String input = Serial.readStringUntil('\n');

  if (input.length() > 0) {
    for (int i = 0; i < LED_COUNT; i++) {
      int startIndex = i * 4;
      if (input.length() >= startIndex + 7) {
        int r = input.substring(startIndex, startIndex + 3).toInt();
        int g = input.substring(startIndex + 2, startIndex + 5).toInt();
        int b = input.substring(startIndex + 4, startIndex + 7).toInt();

        if (r == 0 && g == 0 && b == 0) {
          strip.setPixelColor(i, 0); // Turn off the LED
        } else {
          strip.setPixelColor(i, r, g, b, 0); 
        }
      }
    }
    strip.show(); 
  }
}
