import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TermsAndServices = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={styles.icon.color} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Services</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
    
        <Text style={styles.text}>
          By using this app, you agree to the following:
        </Text>
        <Text style={styles.text}>
          1. Using Tunely and Tunely's services and ressources responsibly.{"\n"}
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
    backgroundColor: '#F9FAFB',
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  backButton: {
    padding: 5,
    paddingBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    color: '#111827',
    fontWeight: '600',
    marginLeft: 10,
    paddingBottom: 2,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1F2937',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
    color: '#374151',
  },
  icon: {
    color: '#1D4ED8',
  },
});

export default TermsAndServices;
