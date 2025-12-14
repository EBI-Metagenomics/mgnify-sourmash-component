// webpack.config.js
const path = require("path");

module.exports = {
  mode: "production",

  entry: {
    "mgnify-sourmash-component": "./src/index.ts",
  },

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    chunkFilename: "[name].js",
    publicPath: "auto",
    clean: true,
  },


  optimization: {
    splitChunks: false,
    runtimeChunk: false,
    chunkIds: "named",
    moduleIds: "deterministic",
  },

  experiments: {
    asyncWebAssembly: true,
  },
  
  module: {
    rules: [
      {
        test: /\.wasm$/,
        type: "asset/inline",
      },
      { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ },
      { test: /\.css$/, loader: "lit-css-loader", options: { import: "lit" } },
    ],
  },

  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    mainFields: ["browser", "module", "main"],
  },

  stats: {
    children: true,
    errorDetails: true,
  },
};
