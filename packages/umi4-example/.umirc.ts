const path =  require('path');
export default {
  npmClient: 'pnpm',
  chainWebpack(config: any, { webpack }: { webpack: any }) {
    config.module.rule('tanfu-loader')
      .test(/\.(ts|js|tsx)$/)
      .exclude
      .add([path.resolve('../src/pages/.umi'), path.resolve('node_modules')])
      .end()
      .use('tanfu-loader')
      .loader('tanfu-loader')
  }
};
