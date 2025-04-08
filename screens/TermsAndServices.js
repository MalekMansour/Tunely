import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TermsAndServices = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={styles.icon.color} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Services</Text>
      </View>
      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F1F1', 
    paddingTop: 20, 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#99a9b9', 
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    color: '#1a1a1a', // Text color
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a', // Text color
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: '#1a1a1a', 
  },
  icon: {
    color: '#182952',

  },
});

export default TermsAndServices;
