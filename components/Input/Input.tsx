/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-empty-function */
import React from 'react';
import { FieldRenderProps } from 'react-final-form';
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputFocusEventData,
  StyleSheet,
  View,
  Text,
} from 'react-native';

type TextFieldProps = FieldRenderProps<string, any> & {
  placeholder?: string;
  type?: string;
  secureTextEntry?: boolean;
  onBlur?: ((e: NativeSyntheticEvent<TextInputFocusEventData>) => void) &
    ((args: any) => void);
  onFocus?: ((e: NativeSyntheticEvent<TextInputFocusEventData>) => void) &
    ((args: any) => void);
};

const Input: React.FC<TextFieldProps> = ({
  input,
  meta,
  type,
  secureTextEntry,
  placeholder,
}: TextFieldProps) => (
  <View>
    <View style={styles.container}>
      <Text style={styles.title}>{placeholder}</Text>
      {meta.error && meta.touched && (
        <Text style={styles.errorText}>{meta.error}</Text>
      )}
    </View>
    {/* @ts-ignore */}
    <TextInput
      style={[
        styles.input,
        { borderColor: meta.touched && meta.error ? `red` : `#F5C500` },
      ]}
      placeholder={placeholder}
      type={type}
      secureTextEntry={secureTextEntry}
      {...input}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: `row`,
    justifyContent: `space-between`,
    alignItems: `center`,
  },
  title: {
    fontSize: 14,
    marginVertical: 5,
  },
  errorText: {
    color: `gray`,
    fontSize: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: `#F5C500`,
    width: 250,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
});

export default Input;
