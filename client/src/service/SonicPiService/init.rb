live_loop :base do
  use_real_time
  
  key, = sync "/osc*/run_code"
  num = key.to_i
  
  
  # 1부터 8까지의 숫자만 처리
  if num >= 1 && num <= 8
    # 현재 재생 중인 샘플을 중단
    kill @current_sample if @current_sample
    
    # 음원을 8등분하여 해당 부분만 재생
    @current_sample = sample "/home/raspberrypi/works/moeta2/client/src/service/SonicPiService/1.wav", slice: 8 - num, num_slices: 8
  end
end

live_loop :melody do
  use_real_time
  
  key, = sync "/osc*/run_code"
  
  
  if key == 'a' || key == 's' || key == 'd'
    # 현재 재생 중인 샘플을 중단
    kill @current_sample2 if @current_sample2
  end
  
  if key == "a"
    @current_sample2 = sample "/home/raspberrypi/works/moeta2/client/src/service/SonicPiService/2.wav"
  elsif key == "s"
    @current_sample2 = sample "/home/raspberrypi/works/moeta2/client/src/service/SonicPiService/3.wav"
  elsif key == "d"
    @current_sample2 = sample "/home/raspberrypi/works/moeta2/client/src/service/SonicPiService/4.wav"
  end
end