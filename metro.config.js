const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const skiaStub = path.resolve(__dirname, 'stubs/react-native-skia.js');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@shopify/react-native-skia') {
    return {
      filePath: skiaStub,
      type: 'sourceFile',
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
