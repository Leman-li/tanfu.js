
const {
  override,
  addDecoratorsLegacy,
  disableEsLint,
  addBundleVisualizer,
  addWebpackAlias,
  addLessLoader,
  adjustWorkbox,
  useBabelRc
} = require("customize-cra");
const path = require("path");

module.exports = override(
  // enable legacy decorators babel plugin
  addDecoratorsLegacy(),

  // disable eslint in webpack
  disableEsLint(),

  useBabelRc(),

  // add webpack bundle visualizer if BUNDLE_VISUALIZE flag is enabled
  process.env.BUNDLE_VISUALIZE == 1 && addBundleVisualizer(),

  // add an alias for "ag-grid-react" imports
  addWebpackAlias({
    ["ag-grid-react$"]: path.resolve(__dirname, "src/shared/agGridWrapper.js")
  }),

  // adjust the underlying workbox
  adjustWorkbox(wb =>
    Object.assign(wb, {
      skipWaiting: true,
      exclude: (wb.exclude || []).concat("index.html")
    })
  ),
  (config) => {
    config.module.rules.push({
      test: /\.(js|ts|tsx)$/,
      loader: 'tanfu-loader',
      exclude: /node_modules/,
      options: {
        replace: process.env.NODE_ENV == 'production' ? './production/static/' : './development/static/'
      }
    }
    )
    console.log(JSON.stringify(config.module.rules.find(item => item.loader === 'tanfu-loader'), null, 2))
    return config;
  }
);