void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
   pinMode(13, OUTPUT);
}

void loop() {

  if (Serial.available() > 0) {
    digitalWrite(13, HIGH);
    String input = Serial.readStringUntil('\n');
    Serial.println("ACK");
  }
}
