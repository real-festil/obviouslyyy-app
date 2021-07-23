import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import firebase from 'firebase/app';
import * as GoogleSignIn from 'expo-google-sign-in';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import SplashScreen from './components/SplashScreen';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  GoogleSignIn.initAsync({
    clientId: `438396112526-iq97uh8vcau91mq8ebvauaa3eg3uu627.apps.googleusercontent.com`,
    scopes: [`profile`, `email`],
  });

  const firebaseConfig = {
    apiKey: `AIzaSyBipmLMvENTzslrY6wR0s2fmzEpsiVy2lU`,
    authDomain: `obviouslyyy-d1813.firebaseapp.com`,
    databaseURL: `https://obviouslyyy-d1813-default-rtdb.firebaseio.com`,
    projectId: `obviouslyyy-d1813`,
    storageBucket: `obviouslyyy-d1813.appspot.com`,
    messagingSenderId: `438396112526`,
    appId: `1:438396112526:web:65d3ade4e0f8818d6ac3df`,
    measurementId: `G-FN4WJP8XZ3`,
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app();
  }

  if (!isLoadingComplete) {
    return null;
  }

  return (
    <SplashScreen
      // eslint-disable-next-line global-require
      image={require(`./assets/images/splash2.png`)}
      // eslint-disable-next-line global-require
      secondImage={require(`./assets/images/splash2.png`)}
    >
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} />
        <StatusBar />
      </SafeAreaProvider>
    </SplashScreen>
  );
}
