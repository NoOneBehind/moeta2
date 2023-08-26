module.exports = {
  apps: [
    {
      name: 'yarn-build',
      script: 'yarn',
      args: 'build',
      autorestart: false, 
    }
  ],
};
