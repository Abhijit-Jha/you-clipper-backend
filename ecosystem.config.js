// ecosystem.config.js
module.exports = {
    apps: [
      {
        name: "api-server",
        script: "dist/index.js",        // Main server entry point (compiled)
        watch: false,
      },
      {
        name: "downloadWorker",
        script: "dist/workers/downloadWorker.js",  // Worker file (compiled)
        watch: false,
      },
      {
        name: "combineWorker",
        script: "dist/workers/combineWorker.js",  // Worker file (compiled)
        watch: false,
      },
      {
        name: "trimWorker",
        script: "dist/workers/trimWorker.js",  // Worker file (compiled)
        watch: false,
      }
    ]
  }
  