const { override, useBabelRc, addWebpackPlugin } = require("customize-cra");
const CompressionPlugin = require("compression-webpack-plugin");
const path = require("path");

module.exports = function override(config, env) {
  // Alias configuration
  config.resolve.alias = {
    ...config.resolve.alias,
    "~": path.resolve(__dirname, "src"),
  };

  // Production optimizations
  if (env === "production") {
    console.log("🚀 Applying production optimizations...");

    // 1. Gzip compression for smaller bundle sizes
    config.plugins.push(
      new CompressionPlugin({
        algorithm: "gzip",
        test: /\.(js|css|html|svg)$/,
        threshold: 8192, // Only compress files > 8KB
        minRatio: 0.8,
      })
    );

    // 2. Optimize chunk splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          // Vendor chunks - external dependencies
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            priority: 10,
            reuseExistingChunk: true,
          },
          // Material-UI chunks
          mui: {
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            name: "mui",
            priority: 20,
            reuseExistingChunk: true,
          },
          // Ant Design chunks
          antd: {
            test: /[\\/]node_modules[\\/]antd[\\/]/,
            name: "antd",
            priority: 20,
            reuseExistingChunk: true,
          },
          // Editor.js chunks
          editor: {
            test: /[\\/]node_modules[\\/]@editorjs[\\/]/,
            name: "editor",
            priority: 20,
            reuseExistingChunk: true,
          },
          // Common chunks used across multiple entry points
          common: {
            minChunks: 2,
            priority: 5,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
      // Runtime chunk for better caching
      runtimeChunk: {
        name: "runtime",
      },
    };

    // 3. Minimize CSS and JS
    config.optimization.minimize = true;

    console.log("✅ Production optimizations applied");
  }

  return config;
};
