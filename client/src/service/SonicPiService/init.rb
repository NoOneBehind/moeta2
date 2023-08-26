live_loop :foo do
  use_real_time
  
  key, = sync "/osc*/run_code"
  num = key.to_i
  sample "/home/raspberrypi/works/moeta2/client/src/service/SonicPiService/sample.wav", start: num * 0.125, finish: (num + 1) * 0.125
end