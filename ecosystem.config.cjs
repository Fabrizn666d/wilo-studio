module.exports = {
  apps: [
    {
      name: "wilo-studio",
      script: ".next/standalone/server.js",
      cwd: __dirname,
      node_args: "--env-file=.env",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_memory_restart: "700M",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOSTNAME: "127.0.0.1",
      },
    },
  ],
};
