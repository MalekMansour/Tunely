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
          1. Users must use Tunely’s services, features, and resources in a lawful and responsible manner. Any misuse or abuse of the platform may result in suspension or termination of access.{"\n"}
          2. We may collect certain data to enhance your experience. This may include, but is not limited to, your name, email address, and location.{"\n"}
          3. Tunely is not liable for any damages resulting from the use or inability to use the platform, including but not limited to data loss, device issues, or service interruptions.{"\n"}
          4. Use of Tunely is limited to individuals who meet the legal age requirement in their jurisdiction. By using the service, you confirm that you meet these requirements.{"\n"}
          5. Tunely reserves the right to modify or discontinue any part of the service at any time without notice.{"\n"}
          6. Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.{"\n"}
          7. Tunely may send you promotional materials, but you can opt-out at any time.{"\n"}
          8. By using Tunely, you agree to comply with all applicable laws and regulations.{"\n"}
          9. You agree not to use the app for any illegal or unauthorized purpose, including but not limited to copyright infringement, harassment, or distribution of malware.{"\n"}
          10. Users may submit content to the platform. By doing so, they grant Tunely a non-exclusive, worldwide, royalty-free license to use, display, and distribute that content within the scope of the service.{"\n"}
          11. Tunely may use third-party services for analytics, advertising, and other purposes. These services may collect data about your usage of the app.{"\n"}
          12. All content, trademarks, and intellectual property on the Tunely platform are the exclusive property of Tunely or its licensors. Unauthorized use or reproduction is strictly prohibited.{"\n"}
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
    marginTop: 30,
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
    marginTop: 20,
  },
  content: {
    padding: 24,
  },
  text: {
    fontSize: 16,
    lineHeight: 28,  
    marginBottom: 24, 
    color: '#374151',
  },
  icon: {
    color: '#1D4ED8',
  },
});

export default TermsAndServices;
