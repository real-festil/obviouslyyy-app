import { StackScreenProps } from '@react-navigation/stack';
import * as React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { Form, Field, FieldRenderProps } from 'react-final-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import firebase from 'firebase/app';
import moment from 'moment';

import { ScrollView } from 'react-native-gesture-handler';
import Input from '../components/Input';
import { RootStackParamList } from '../types';
import { composeValidators, required, minLength } from '../utils/validation';

require(`@firebase/database`);

require(`firebase/auth`);

export default function SignUpScreen({
  navigation,
}: StackScreenProps<RootStackParamList, 'SignUp'>) {
  const [isDatePickerVisible, setIsDatePickerVisible] = React.useState(false);

  const onSubmit = ({
    email,
    password,
    firstName,
    lastName,
    birthday,
  }: any) => {
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const { user } = userCredential;
        if (user && user.emailVerified === false) {
          user
            .sendEmailVerification()
            .then(() => {
              Alert.alert(`Done`, `Check your email for confirmation`, [
                { text: `OK`, onPress: () => navigation.replace(`SignIn`) },
              ]);
            })
            .catch((error) => {
              console.log(`error`, error);
            });
        }
        if (user) {
          firebase
            .database()
            .ref(`users/${user.uid}`)
            .set({
              firstName,
              lastName,
              birthday: JSON.stringify(birthday),
              email,
            });
        }
      })
      .catch((error) => {
        Alert.alert(`Error`, error.message, [{ text: `OK` }]);
      });
  };

  return (
    <KeyboardAvoidingView behavior="height" style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <Form
        onSubmit={onSubmit}
        render={({ handleSubmit }) => (
          <View>
            <Field
              name="firstName"
              placeholder="First Name"
              validate={required}
            >
              {({ input, meta, placeholder }) => (
                <Input input={input} meta={meta} placeholder={placeholder} />
              )}
            </Field>
            <Field name="lastName" placeholder="Last Name" validate={required}>
              {({ input, meta, placeholder }) => (
                <Input input={input} meta={meta} placeholder={placeholder} />
              )}
            </Field>
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
            <Field name="birthday" placeholder="Birthday">
              {({ input }) => (
                <View>
                  <Text style={styles.label}>Birthday</Text>
                  <TouchableOpacity
                    style={styles.birthday}
                    onPress={() => setIsDatePickerVisible(true)}
                  >
                    <Text style={{ color: input.value ? `black` : `gray` }}>
                      {input.value
                        ? moment(input.value).format(`YYYY.MM.DD`)
                        : `Select date`}
                    </Text>
                  </TouchableOpacity>
                  {isDatePickerVisible && (
                    <DateTimePicker
                      testID="dateTimePicker"
                      value={input.value || new Date()}
                      mode="date"
                      is24Hour
                      display="spinner"
                      onChange={(e: any) => {
                        setIsDatePickerVisible(false);
                        if (e.nativeEvent.timestamp) {
                          input.onChange(e.nativeEvent.timestamp);
                        }
                      }}
                    />
                  )}
                </View>
              )}
            </Field>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity
        onPress={() => navigation.replace(`SignIn`)}
        style={styles.link}
      >
        <Text>
          Already have an account?
          <Text style={styles.linkText}> Sign In</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
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
  },
});
