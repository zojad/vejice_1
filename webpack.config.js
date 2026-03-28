// webpack.config.js
/* eslint-disable no-undef */

const path = require("path");
const webpack = require("webpack");
const devCerts = require("office-addin-dev-certs");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("dotenv").config({ path: path.resolve(__dirname, ".env.local"), override: true });

// Dev & Prod base URLs
const urlDev = "https://localhost:4001/";
const urlProd = "https://zojad.github.io/vejice_1/";

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions();
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert };
}

function parseBuildBooleanFlag(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["1", "true", "yes", "on"].includes(normalized)) return true;
    if (["0", "false", "no", "off"].includes(normalized)) return false;
  }
  return fallback;
}

module.exports = async (env, options) => {
  const enableOnlineReviewActions = parseBuildBooleanFlag(
    process.env.VEJICE_ENABLE_ONLINE_REVIEW_ACTIONS,
    false
  );
  const config = {
    devtool: "source-map",
    entry: {
      polyfill: ["core-js/stable", "regenerator-runtime/runtime"],
      commands: "./src/commands/commands.js",
      taskpane: "./src/taskpane/taskpane.js",
    },
    output: {
      filename: "[name].js",
      path: path.resolve(__dirname, "docs"),
      clean: true,
    },
    resolve: { extensions: [".html", ".js"] },
    module: {
      rules: [
        { test: /\.js$/, exclude: /node_modules/, use: { loader: "babel-loader" } },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: { loader: "html-loader", options: { sources: false } },
        },
        {
          test: /\.(png|jpg|jpeg|gif|ico)$/i,
          type: "asset/resource",
          generator: { filename: "assets/[name][ext][query]" },
        },
      ],
    },
    optimization: {
      runtimeChunk: {
        name: "runtime",
      },
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          default: false,
          defaultVendors: false,
          common: {
            name: "common",
            minChunks: 2,
            chunks: (chunk) => ["commands", "taskpane"].includes(chunk.name),
            enforce: true,
          },
        },
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        filename: "commands.html",
        template: "./src/commands/commands.html",
        chunks: ["runtime", "polyfill", "common", "commands"],
        inject: "body",
      }),
      new HtmlWebpackPlugin({
        filename: "taskpane.html",
        template: "./src/taskpane/taskpane.html",
        chunks: ["runtime", "polyfill", "common", "taskpane"],
        inject: "body",
      }),
      new webpack.DefinePlugin({
        __VEJICE_ENABLE_ONLINE_REVIEW_ACTIONS__: JSON.stringify(
          enableOnlineReviewActions
        ),
        "process.env.VEJICE_API_URL": JSON.stringify(process.env.VEJICE_API_URL || ""),
        "process.env.VEJICE_USE_MOCK": JSON.stringify(process.env.VEJICE_USE_MOCK || ""),
        "process.env.VEJICE_USE_LEMMATIZER": JSON.stringify(process.env.VEJICE_USE_LEMMATIZER || ""),
        "process.env.VEJICE_DISABLE_PARAGRAPH_CACHE": JSON.stringify(
          process.env.VEJICE_DISABLE_PARAGRAPH_CACHE || ""
        ),
        "process.env.VEJICE_PARAGRAPH_CACHE_DISABLED": JSON.stringify(
          process.env.VEJICE_PARAGRAPH_CACHE_DISABLED || ""
        ),
        "process.env.VEJICE_ENABLE_PARAGRAPH_CACHE": JSON.stringify(
          process.env.VEJICE_ENABLE_PARAGRAPH_CACHE || ""
        ),
        "process.env.VEJICE_ONLINE_UNSTABLE_BACKOFF_NON_COMMA_THRESHOLD": JSON.stringify(
          process.env.VEJICE_ONLINE_UNSTABLE_BACKOFF_NON_COMMA_THRESHOLD || ""
        ),
        "process.env.VEJICE_LEMMATIZER_ANCHORS": JSON.stringify(
          process.env.VEJICE_LEMMATIZER_ANCHORS || ""
        ),
        "process.env.VEJICE_LEMMAS_URL": JSON.stringify(process.env.VEJICE_LEMMAS_URL || ""),
        "process.env.VEJICE_LEMMAS_TIMEOUT_MS": JSON.stringify(
          process.env.VEJICE_LEMMAS_TIMEOUT_MS || ""
        ),
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: "assets/*", to: "assets/[name][ext][query]" },
          { from: "src/commands/toast.html", to: "toast.html" },
          { from: "src/taskpane/taskpane.css", to: "taskpane.css" },
          { from: "src/manifests/manifest.dev.xml", to: "manifest.dev.xml" },
          {
            from: "src/manifests/manifest.dev.xml",
            to: "manifest.prod.xml",
            transform(content) {
              return content.toString().replace(new RegExp(urlDev, "g"), urlProd);
            },
          },
          { from: "src/manifests/manifest.web.xml", to: "manifest.web.xml" },
          {
            from: "src/manifests/manifest.web.xml",
            to: "manifest.web.prod.xml",
            transform(content) {
              return content.toString().replace(new RegExp(urlDev, "g"), urlProd);
            },
          },
        ],
      }),
    ],
    devServer: {
      // If you need to reach from another device/VM, switch host to "0.0.0.0"
      host: "localhost",
      allowedHosts: "all",
      port: 4001,
      static: "./docs",
      server: {
        type: "https",
        options:
          env.WEBPACK_BUILD || options.https !== undefined
            ? options.https
            : await getHttpsOptions(),
      },
      headers: {
        // CORS
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
        // Required for Chrome’s Private Network Access (public -> localhost)
        "Access-Control-Allow-Private-Network": "true",
      },
      // write actual files so Word Online can fetch them reliably
      devMiddleware: { writeToDisk: true },
      // Same-origin lemma endpoint for Word Online; avoids browser CORS/mixed-content issues.
      proxy: [
        {
          context: ["/api/postavi_vejice"],
          target: `http://127.0.0.1:${process.env.VEJICE_PROXY_PORT || 5051}`,
          changeOrigin: true,
          secure: false,
        },
        {
          context: ["/lemmas", "/health"],
          target: `http://127.0.0.1:${process.env.LEMMAS_PROXY_PORT || 5050}`,
          changeOrigin: true,
          secure: false,
        },
      ],
    },
  };
  return config;
};
