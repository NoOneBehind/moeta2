def play_sample_from_key(num, sample_path, options = {})
  kill_instance_variable_if_defined(:@current_sample)
  
  sample sample_path, options.merge(slice: 8 - num, num_slices: 8)
end

def kill_instance_variable_if_defined(variable)
  instance_variable = instance_variable_get(variable)
  kill instance_variable if instance_variable
end

def key_to_sample_path(key)
  {
    'a' => "/home/raspberrypi/works/moeta2/client/src/service/SonicPiService/2.wav",
    's' => "/home/raspberrypi/works/moeta2/client/src/service/SonicPiService/3.wav",
    'd' => "/home/raspberrypi/works/moeta2/client/src/service/SonicPiService/4.wav",
    'f' => "/home/raspberrypi/works/moeta2/client/src/service/SonicPiService/5.wav",
    'g' => "/home/raspberrypi/works/moeta2/client/src/service/SonicPiService/6.wav"
  }[key]
end

live_loop :base do
  use_real_time
  
  key, = sync "/osc*/run_code"
  num = key.to_i
  
  if (1..8).include?(num)
    @current_sample = play_sample_from_key(num, "/home/raspberrypi/works/moeta2/client/src/service/SonicPiService/1.wav")
  end
end

live_loop :melody do
  use_real_time
  
  key, = sync "/osc*/run_code"
  
  if ['a', 's', 'd', 'f', 'g'].include?(key)
    kill_instance_variable_if_defined(:@current_sample2)
    
    sample_path = key_to_sample_path(key)
    @current_sample2 = sample sample_path if sample_path
  end
end