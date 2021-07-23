import { StackScreenProps } from '@react-navigation/stack';
import firebase from 'firebase';
import * as React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';
import { RootStackParamList } from '../types';

export default function TabOneScreen({
  navigation,
}: StackScreenProps<RootStackParamList, 'Dashboard'>) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <TouchableOpacity
        onPress={() => {
          firebase.auth().signOut();
          navigation.navigate(`SignIn`);
        }}
      >
        <Text>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: `center`,
    justifyContent: `center`,
  },
  title: {
    fontSize: 20,
    fontWeight: `bold`,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: `80%`,
  },
});
