import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const TermsAndServices = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Terms & Services</Text>
      <Text style={styles.text}>
        By using this app, you agree to the following:
      </Text>
      <Text style={styles.text}>
        1. Use the app responsibly.{"\n"}
        2. We may collect some basic data to improve your experience.{"\n"}
        3. We’re not responsible if you break your phone using the app.{"\n"}
        4. These terms can change anytime, so stay updated.
      </Text>
      <Text style={styles.text}>
        By continuing to use the app, you acknowledge that you have read and understood these terms and agree to be bound by them. If you do not agree to these terms, please do not use the app. 
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export default TermsAndServices;
