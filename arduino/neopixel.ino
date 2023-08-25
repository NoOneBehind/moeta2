#include <Adafruit_NeoPixel.h>

#define LED_PIN 7       // Neopixel D Pin
#define LED_COUNT 8     // Number of Neopixel LEDs
#define BRIGHTNESS 255  // Neopixel brightness (0 ~ 255)

#define FADE_INTERVAL 30
#define DURATION 2000

#define PIXEL_NUM 4

Adafruit_NeoPixel strip(LED_COUNT, LED_PIN, NEO_GRBW + NEO_KHZ800);

int steps = DURATION / (2 * FADE_INTERVAL);

enum State {
    IDLE,
    READY,
  	IN_PROGRESS
};

enum EasingType {
  EASE_OUT_QUAD
};

struct Pixel {
  	uint8_t r;
    uint8_t g;
    uint8_t b;
  	EasingType easingType;
    unsigned long startTime;
    float progress;
    State state;
};

float easingFuncion(float x) {
  return 4*x*(1-x);
}

Pixel pixelArray[PIXEL_NUM] = {
    {255, 0, 0, EASE_OUT_QUAD, 0, IDLE},
    {0, 255, 0, EASE_OUT_QUAD, 0, IDLE},
    {0, 0, 255, EASE_OUT_QUAD, 0, IDLE},
    {255, 0, 255, EASE_OUT_QUAD, 0, IDLE},
};

void setup() {
  Serial.begin(9600);
  strip.begin();                    
  strip.setBrightness(BRIGHTNESS);
  strip.show(); 
}

void loop() {
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');

    if (input.length() > 0) {
      if (input == "1") {
        pixelArray[0].state = READY;
      } else if (input == "2") {
        pixelArray[1].state = READY;
      } else if (input == "3") {
        pixelArray[2].state = READY;
      } else if (input == "4") {
        pixelArray[3].state = READY;
      }
    }
  }

  for (int i = 0; i < PIXEL_NUM; ++i) {
    if (pixelArray[i].state == READY) {
      pixelArray[i].startTime = millis();
      pixelArray[i].state = IN_PROGRESS;
    }

    if (pixelArray[i].state == IN_PROGRESS) {
      unsigned long elapsedTime = millis() - pixelArray[i].startTime;
      if (elapsedTime > DURATION) {
        pixelArray[i].state = IDLE;
        strip.setPixelColor(i, 0);

        return;
      } 

      float currentProgress = (float)(elapsedTime) / DURATION;
      float factor = easingFuncion(currentProgress);

      uint8_t nextR = pixelArray[i].r * factor;
      uint8_t nextG = pixelArray[i].g * factor;
      uint8_t nextB = pixelArray[i].b * factor;

      strip.setPixelColor(i, nextR, nextG, nextB);

      pixelArray[i].progress = currentProgress;
    }
  }

  strip.show();
}
