const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  runtimeCompiler: true,
  configureWebpack: {
    devServer: {
      client: {
        overlay: {
          runtimeErrors: (error) => {
            if (error.message === "ResizeObserver loop limit exceeded") {
              return false;
            }
            return true;
          },
        }
      }
    }
  }
})
