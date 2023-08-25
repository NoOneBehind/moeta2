#include <Adafruit_NeoPixel.h>

#define LED_PIN 7       // Neopixel D Pin
#define BRIGHTNESS 255  // Neopixel brightness (0 ~ 255)

#define DURATION 2000

#define PIXEL_NUM 4

Adafruit_NeoPixel strip(PIXEL_NUM, LED_PIN, NEO_GRBW + NEO_KHZ800);

enum State {
  IDLE,
  READY,
  IN_PROGRESS
};

enum EasingType {
  EASE_OUT_QUAD,
  EASE_OUT_BOUNCE,
  EASE_IN_BOUNCE,
  EASE_IN_OUT_BOUNCE,
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

EasingType getRandomEasingType() {
  int maxValue = EASE_IN_OUT_BOUNCE;
  int randomValue = random(0, maxValue + 1);
  return static_cast<EasingType>(randomValue);
}

float easeOutQuad(float x) {
  return 4 * x * (1 - x);
}

float easeOutBounce(float x) {
  const float n1 = 7.5625;
  const float d1 = 2.85;

  if (x < 1 / d1) {
    return n1 * x * x;
  } else if (x < 2 / d1) {
    x -= 1.5 / d1;
    return n1 * x * x + 0.75;
  } else if (x < 2.5 / d1) {
    x -= 2.25 / d1;
    return n1 * x * x + 0.9375;
  } else {
    x -= 2.625 / d1;
    return n1 * x * x + 0.984375;
  }
}

float easeInBounce(float x) {
  return 1 - easeOutBounce(1 - x);
}

float easeInOutBounce(float x) {
  return x < 0.5
           ? (1 - easeOutBounce(1 - 2 * x)) / 2
           : (1 + easeOutBounce(2 * x - 1)) / 2;
}

float (*getFunction(EasingType type))(float) {
  switch (type) {
    case EASE_OUT_QUAD:
      return easeOutQuad;
    case EASE_OUT_BOUNCE:
      return easeOutBounce;
    case EASE_IN_BOUNCE:
      return easeInBounce;
    case EASE_IN_OUT_BOUNCE:
      return easeInOutBounce;

    default:
      return nullptr;  // 없는 함수 타입의 경우 nullptr 반환
  }
}

Pixel pixelArray[PIXEL_NUM] = {
  { 255, 0, 0, EASE_OUT_QUAD, 0, IDLE },
  { 0, 255, 0, EASE_OUT_BOUNCE, 0, IDLE },
  { 0, 0, 255, EASE_IN_BOUNCE, 0, IDLE },
  { 255, 0, 255, EASE_IN_OUT_BOUNCE, 0, IDLE },
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
      // pixelArray[i].easingType = getRandomEasingType();

      pixelArray[i].state = IN_PROGRESS;
    }

    if (pixelArray[i].state == IN_PROGRESS) {
      unsigned long elapsedTime = millis() - pixelArray[i].startTime;
      if (elapsedTime > DURATION) {
        pixelArray[i].state = IDLE;
        strip.setPixelColor(i, 0, 0, 0, 0);

        return;
      }

      float currentProgress = (float)(elapsedTime) / DURATION;
      float factor = getFunction(pixelArray[i].easingType)(currentProgress);

      uint8_t nextR = pixelArray[i].r * factor;
      uint8_t nextG = pixelArray[i].g * factor;
      uint8_t nextB = pixelArray[i].b * factor;

      strip.setPixelColor(i, nextR, nextG, nextB, 100 * factor);

      pixelArray[i].progress = currentProgress;
    }
  }

  strip.show();
}
