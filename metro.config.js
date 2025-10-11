// Patch os.availableParallelism globally before any Metro imports
const os = require('os');
if (!os.availableParallelism) {
  os.availableParallelism = () => os.cpus().length;
}

const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  maxWorkers: 2, // Override to avoid os.availableParallelism() issue
  resolver: {
    assetExts: ['bin', 'txt', 'jpg', 'png', 'json', 'mp4', 'ttf', 'otf', 'wav', 'mp3', 'm4a', 'aac', 'oga', 'ogg', 'wav'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
