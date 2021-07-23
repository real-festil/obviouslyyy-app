/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-return-await */
import { StackScreenProps } from '@react-navigation/stack';
import * as React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Form, Field, FieldRenderProps } from 'react-final-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import firebase from 'firebase/app';
import moment from 'moment';
import * as GoogleSignIn from 'expo-google-sign-in';
import * as Facebook from 'expo-facebook';

import { ScrollView } from 'react-native-gesture-handler';
import Input from '../components/Input';
import { RootStackParamList } from '../types';
import { composeValidators, required, minLength } from '../utils/validation';

require(`@firebase/database`);

require(`firebase/auth`);

export default function SignInScreen({
  navigation,
}: StackScreenProps<RootStackParamList, 'SignUp'>) {
  const [isLoading, setIsLoading] = React.useState(false);
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().languageCode = `it`;

  const onSubmit = ({ email, password }: any) => {
    setIsLoading(true);
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const { user } = userCredential;
        if (user && !user.emailVerified) {
          setIsLoading(false);
          Alert.alert(`Error`, `Please, verify your email`, [{ text: `OK` }]);
        }
        if (user && user.emailVerified) {
          setIsLoading(false);
          navigation.navigate(`Dashboard`);
        }
      })
      .catch((error) => {
        setIsLoading(false);
        Alert.alert(`Error`, error.message, [{ text: `OK` }]);
      });
  };

  const isUserEqual = (googleUser: any, firebaseUser: any) => {
    if (firebaseUser) {
      const { providerData } = firebaseUser;
      for (let i = 0; i < providerData.length; i++) {
        if (
          providerData[i].providerId ===
            firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
          providerData[i].uid === googleUser.getBasicProfile().getId()
        ) {
          // We don't need to reauth the Firebase connection.
          return true;
        }
      }
    }
    return false;
  };

  const googleSignIn = async () => {
    try {
      await GoogleSignIn.askForPlayServicesAsync();
      const googleResult = await GoogleSignIn.signInAsync();
      const user = await GoogleSignIn.signInSilentlyAsync();
      if (googleResult.type === `success`) {
        setIsLoading(true);
        const unsubscribe = firebase
          .auth()
          .onAuthStateChanged((firebaseUser) => {
            unsubscribe();
            // Check if we are already signed-in Firebase with the correct user.
            if (!isUserEqual(googleResult, firebaseUser)) {
              // Build Firebase credential with the Google ID token.
              const credential = firebase.auth.GoogleAuthProvider.credential(
                user?.auth?.idToken,
                user?.auth?.accessToken,
              );
              // Sign in with credential from the Google user.
              firebase
                .auth()
                .signInWithCredential(credential)
                .then((result) => {
                  if (result.additionalUserInfo!.isNewUser) {
                    firebase
                      .database()
                      .ref(`/users/${result.user!.uid}`)
                      .set({
                        firstName:
                          result!.additionalUserInfo!.profile!.given_name,
                        lastName:
                          result!.additionalUserInfo!.profile!.family_name,
                      })
                      .then((snapshot) => {
                        setIsLoading(false);
                        navigation.navigate(`Dashboard`);
                      });
                  } else {
                    setIsLoading(false);
                    navigation.navigate(`Dashboard`);
                    // Alert.alert(`succesfully signed in`);
                  }
                })
                .catch((error) => {
                  // Handle Errors here.
                  const errorCode = error.code;
                  const errorMessage = error.message;
                  // The email of the user's account used.
                  const { email } = error;
                  // The firebase.auth.AuthCredential type that was used.
                  const { credential } = error;
                  Alert.alert(error.message);
                  setIsLoading(false);
                });
            } else {
              setIsLoading(false);
              // Alert.alert(`User already signed-in Firebase.`);
            }
          });
      }
    } catch ({ message }) {
      setIsLoading(false);
      Alert.alert(`login: Error:${message}`);
    }
  };

  const facebookSignIn = async () => {
    try {
      await Facebook.initializeAsync({
        appId: `353765716268201`,
      });
      const { type, token } = await Facebook.logInWithReadPermissionsAsync({
        permissions: [`public_profile`],
      });
      if (type === `success`) {
        setIsLoading(true);
        const unsubscribe = firebase
          .auth()
          .onAuthStateChanged(async (firebaseUser) => {
            unsubscribe();
            // Check if we are already signed-in Firebase with the correct user.
            // if (!isUserEqual(facebookUser.json(), firebaseUser)) {
            // Build Firebase credential with the Google ID token.
            const credential =
              firebase.auth.FacebookAuthProvider.credential(token);
            // Sign in with credential from the Google user.
            const facebookProfileData = await firebase
              .auth()
              .signInWithCredential(credential);
            console.log(`facebookProfileData`, facebookProfileData);
            firebase
              .auth()
              .signInWithCredential(credential)
              .then(async (result) => {
                if (facebookProfileData.additionalUserInfo!.isNewUser) {
                  firebase
                    .database()
                    .ref(`/users/${facebookProfileData.user!.uid}`)
                    .set({
                      firstName:
                        facebookProfileData!.additionalUserInfo!.profile!
                          .first_name,
                      lastName:
                        facebookProfileData!.additionalUserInfo!.profile!
                          .last_name,
                    })
                    .then((snapshot) => {
                      setIsLoading(false);
                      navigation.navigate(`Dashboard`);
                    });
                } else {
                  setIsLoading(false);
                  navigation.navigate(`Dashboard`);
                }
              })
              .catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const { email } = error;
                // The firebase.auth.AuthCredential type that was used.
                const { credential } = error;
                Alert.alert(error.message);
                setIsLoading(false);
              });
            // } else {
            //   Alert.alert(`User already signed-in Firebase.`);
            // }
          });
      }
    } catch ({ message }) {
      setIsLoading(false);
      Alert.alert(`Facebook Login Error: ${message}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sign In</Text>
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit }) => (
          <View>
            <Field name="email" placeholder="Email" validate={required}>
              {({ input, meta, placeholder }) => (
                <Input input={input} meta={meta} placeholder={placeholder} />
              )}
            </Field>
            <Field
              name="password"
              placeholder="Password"
              validate={composeValidators(required, minLength(6))}
            >
              {({ input, meta, placeholder }) => (
                <Input
                  input={input}
                  meta={meta}
                  placeholder={placeholder}
                  secureTextEntry
                />
              )}
            </Field>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => googleSignIn()}
      >
        <Text style={styles.buttonText}>Sign In With Google</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.submitButton}
        onPress={() => facebookSignIn()}
      >
        <Text style={styles.buttonText}>Sign In With Facebook</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.replace(`SignUp`)}
        style={styles.link}
      >
        <Text>
          Don&apos;t have account?
          <Text style={styles.linkText}> Sign Up</Text>
        </Text>
      </TouchableOpacity>
      {isLoading && (
        <View style={styles.spinner}>
          <ActivityIndicator size="large" color="#F5C500" />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: `#fff`,
    alignItems: `center`,
    justifyContent: `center`,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: `bold`,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 14,
    color: `#F5C500`,
  },
  label: {
    marginVertical: 5,
  },
  birthday: {
    borderWidth: 1,
    borderColor: `#F5C500`,
    width: 250,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
  },
  submitButton: {
    backgroundColor: `#F5C500`,
    width: 250,
    borderRadius: 6,
    marginTop: 25,
  },
  buttonText: {
    paddingVertical: 10,
    color: `white`,
    textAlign: `center`,
    fontSize: 18,
    fontWeight: `bold`,
    justifyContent: `center`,
  },
  spinner: {
    position: `absolute`,
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `rgba(0,0,0,0.7)`,
    justifyContent: `center`,
    alignItems: `center`,
  },
});
