/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Asset } from 'expo-asset';
import AppLoading from 'expo-app-loading';
import Constants from 'expo-constants';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';

export default function AnimatedAppLoader({ children, image, secondImage }) {
  const [isSplashReady, setSplashReady] = React.useState(false);

  const startAsync = React.useMemo(
    // If you use a local image with require(...), use `Asset.fromModule`
    () => () => Asset.fromModule(image).downloadAsync(),
    [image],
  );

  const cacheResourcesAsync = async () => {
    console.log(`started`);
    const images = [image, secondImage];

    const cacheImages = images.map((img) =>
      Asset.fromModule(img).downloadAsync(),
    );
    await Promise.all(cacheImages);
    console.log(`ended`);
  };

  const onFinish = React.useMemo(() => setSplashReady(true), []);

  if (!isSplashReady) {
    return (
      <AppLoading
        autoHideSplash={false}
        startAsync={startAsync}
        onFinish={onFinish}
        onError={(e) => console.log(e)}
      />
    );
  }

  return (
    <AnimatedSplashScreen image={image} secondImage={secondImage}>
      {children}
    </AnimatedSplashScreen>
  );
}

function AnimatedSplashScreen({ children, image, secondImage }) {
  const animation = React.useMemo(() => new Animated.Value(1), []);
  const animation2 = React.useMemo(() => new Animated.Value(0), []);
  const [isAnimReady, setAnimReady] = React.useState(false);
  const [isAppReady, setAppReady] = React.useState(false);
  const [isSplashAnimationComplete, setAnimationComplete] =
    React.useState(false);
  const [isBetweenAnimReady, setIsBetweenAnimReady] = React.useState(false);
  const [isSplashAnimation2Complete, setAnimation2Complete] =
    React.useState(false);
  const [backgroundColor, setBackgroundColor] = React.useState(`#f5c500`);

  React.useEffect(() => {
    if (isAnimReady) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => setAnimationComplete(true));
    }
  }, [isAnimReady]);

  React.useEffect(() => {
    if (isSplashAnimationComplete) {
      Animated.timing(animation2, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        setIsBetweenAnimReady(true);
        setBackgroundColor(`transparent`);
        setTimeout(() => {
          Animated.timing(animation2, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }).start(() => setAnimation2Complete(true));
        }, 1000);
      });
    }
  }, [isSplashAnimationComplete]);

  const onImage2Loaded = React.useMemo(
    () => async () => {
      try {
        // await SplashScreen.hideAsync();
        // Load stuff
        // await Promise.all([]);
      } catch (e) {
        // handle errors
      } finally {
        setAppReady(true);
      }
    },
    [],
  );

  const onImageLoaded = React.useMemo(
    () => async () => {
      try {
        await SplashScreen.hideAsync();
        // Load stuff
        await Promise.all([]);
      } catch (e) {
        // handle errors
      } finally {
        setAnimReady(true);
      }
    },
    [],
  );

  return (
    <View style={{ flex: 1, backgroundColor }}>
      {isAppReady && isBetweenAnimReady && children}
      {!isSplashAnimationComplete && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: Constants.manifest!.splash!.backgroundColor,
              opacity: animation,
            },
          ]}
        >
          <Image
            style={{
              width: `100%`,
              height: `100%`,
              resizeMode: Constants.manifest!.splash!.resizeMode || `contain`,
              // transform: [
              //   {
              //     scale: animation,
              //   },
              // ],
            }}
            source={image}
            onLoadEnd={onImageLoaded}
            fadeDuration={0}
          />
        </Animated.View>
      )}
      {!isSplashAnimation2Complete && isSplashAnimationComplete && (
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: Constants.manifest!.splash!.backgroundColor,
              opacity: animation2,
            },
          ]}
        >
          <Animated.Image
            style={{
              width: `100%`,
              height: `100%`,
              resizeMode: Constants.manifest!.splash!.resizeMode || `contain`,
              opacity: animation2,
            }}
            source={secondImage}
            onLoadEnd={onImage2Loaded}
            fadeDuration={0}
          />
        </Animated.View>
      )}
    </View>
  );
}
