module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // NativeWind
      'nativewind/babel',
      // Reanimated plugin should be listed last
      'react-native-reanimated/plugin',
    ],
  };
};