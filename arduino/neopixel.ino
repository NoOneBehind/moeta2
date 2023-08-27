#include <Adafruit_NeoPixel.h>

#define LED_PIN1 7  // Neopixel D Pin
#define LED_PIN2 8  // Neopixel D Pin
#define LED_PIN3 9  // Neopixel D Pin
#define LED_MAIN_PIN 10
#define BRIGHTNESS 255  // Neopixel brightness (0 ~ 255)

#define DURATION 2000

#define PIXEL_NUM_ON_STRIP1 8
#define PIXEL_NUM_ON_STRIP2 4
#define PIXEL_NUM_ON_STRIP3 4
#define TOTAL_PIXEL_NUM PIXEL_NUM_ON_STRIP1 + PIXEL_NUM_ON_STRIP2 + PIXEL_NUM_ON_STRIP3

Adafruit_NeoPixel strip1(PIXEL_NUM_ON_STRIP1, LED_PIN1, NEO_GRBW + NEO_KHZ800);
Adafruit_NeoPixel strip2(PIXEL_NUM_ON_STRIP2, LED_PIN2, NEO_GRBW + NEO_KHZ800);
Adafruit_NeoPixel strip3(PIXEL_NUM_ON_STRIP3, LED_PIN3, NEO_GRBW + NEO_KHZ800);
Adafruit_NeoPixel stripMain(8, LED_MAIN_PIN, NEO_GRBW + NEO_KHZ800);

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
  uint8_t w;
  EasingType easingType;
  unsigned long startTime;
  float progress;
  State state;
};

struct PixelData {
  int index;
  EasingType easingType;
  uint8_t r;
  uint8_t g;
  uint8_t b;
  uint8_t w;
};

String splitString(String &data, char delimiter = ' ') {
  int pos = data.indexOf(delimiter);
  if (pos == -1) return data;

  String split = data.substring(0, pos);
  data = data.substring(pos + 1);
  return split;
}

PixelData parseInput(String input) {
  PixelData data;
  data.index = splitString(input).toInt();
  data.easingType = static_cast<EasingType>(splitString(input).toInt());
  data.r = splitString(input).toInt();
  data.g = splitString(input).toInt();
  data.b = splitString(input).toInt();
  data.w = input.toInt();

  return data;
}

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
      return nullptr;
  }
}

Pixel pixelArray[TOTAL_PIXEL_NUM];

void setup() {
  Serial.begin(9600);
  strip1.begin();
  strip1.setBrightness(BRIGHTNESS);
  strip1.show();
  strip2.begin();
  strip2.setBrightness(BRIGHTNESS);
  strip2.show();
  strip3.begin();
  strip3.setBrightness(BRIGHTNESS);
  strip3.show();
  stripMain.begin();
  stripMain.setBrightness(BRIGHTNESS);
  stripMain.show();

  for (int i = 0; i < 8; ++i) {
    stripMain.setPixelColor(i, stripMain.Color(255, 255, 255, 255));
  }
  stripMain.show();
}

void loop() {
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');

    if (input.length() > 0) {
      PixelData pixelData = parseInput(input);
      int index = pixelData.index;


      pixelArray[index].easingType = pixelData.easingType;

      pixelArray[index].r = pixelData.r;
      pixelArray[index].g = pixelData.g;
      pixelArray[index].b = pixelData.b;
      pixelArray[index].w = pixelData.w;

      pixelArray[index].state = READY;
    }
  }

  for (int i = 0; i < TOTAL_PIXEL_NUM; ++i) {
    if (pixelArray[i].state == READY) {
      pixelArray[i].startTime = millis();
      // pixelArray[i].easingType = getRandomEasingType();

      pixelArray[i].state = IN_PROGRESS;
    }

    if (pixelArray[i].state == IN_PROGRESS) {
      unsigned long elapsedTime = millis() - pixelArray[i].startTime;
      if (elapsedTime > DURATION) {
        pixelArray[i].state = IDLE;
        if (i < PIXEL_NUM_ON_STRIP1) {
          strip1.setPixelColor(i, 0, 0, 0, 0);
        } else if (i < PIXEL_NUM_ON_STRIP1 + PIXEL_NUM_ON_STRIP2) {
          strip2.setPixelColor(i - PIXEL_NUM_ON_STRIP1, 0, 0, 0, 0);
        } else {
          strip3.setPixelColor(i - PIXEL_NUM_ON_STRIP1 - PIXEL_NUM_ON_STRIP2, 0, 0, 0, 0);
        }
      } else {
        float currentProgress = (float)(elapsedTime) / DURATION;
        float factor = getFunction(pixelArray[i].easingType)(currentProgress);

        uint8_t nextR = pixelArray[i].r * factor;
        uint8_t nextG = pixelArray[i].g * factor;
        uint8_t nextB = pixelArray[i].b * factor;
        uint8_t nextW = pixelArray[i].w * factor;

        if (i < PIXEL_NUM_ON_STRIP1) {
          strip1.setPixelColor(i, nextR, nextG, nextB, nextW);
        } else if (i < PIXEL_NUM_ON_STRIP1 + PIXEL_NUM_ON_STRIP2) {
          strip2.setPixelColor(i - PIXEL_NUM_ON_STRIP1, nextR, nextG, nextB, nextW);
        } else {
          strip3.setPixelColor(i - PIXEL_NUM_ON_STRIP1 - PIXEL_NUM_ON_STRIP2, nextR, nextG, nextB, nextW);
        }

        pixelArray[i].progress = currentProgress;
      }
    }
  }

  strip1.show();
  strip2.show();
  strip3.show();
}
