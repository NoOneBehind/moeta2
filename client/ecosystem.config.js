module.exports = {
  apps: [
    {
      name: 'sonic-pi-script',
      script: 'bash',
      args: '-c "cat ./src/service/SonicPiService/init.rb | sonic_pi"',
      autorestart: false, 
    },
    {
      name: 'yarn-build',
      script: 'yarn',
      args: 'build',
      autorestart: false, 
    }
  ],
};
