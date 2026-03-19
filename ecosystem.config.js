module.exports = {
    apps: [
      {
        name: "my-nextjs-app",
        script: "npm",
        args: "start",
        env: {
          PAYLOAD_CONFIG_PATH: "dist/payload.config.js",
          NODE_ENV: "production",
        },
        watch: false
      }
    ]
  };
  