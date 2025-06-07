import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Linking
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Youtube from 'react-native-vector-icons/Entypo';
import Instagram from 'react-native-vector-icons/AntDesign';
import Email from 'react-native-vector-icons/MaterialCommunityIcons';

const OldHome = ({navigation}:any) => {
  const contact_us_url = 'https://goidea.co/contact?mobile=true';
 
  return (
     <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.centeredView}>
        <Text style={styles.comingSoonText}>Coming Soon...</Text>
        <Text style={{ color: '#4a3218' }}>We're working hard to bring something awesome.</Text>
        <View style={{ flexDirection: 'row', gap: 20, marginTop: 15 }}>
          <Icon name="facebook" size={20} color="#4a3218" onPress={() => Linking.openURL('https://www.facebook.com/yogiverse.in')} />        
          <Youtube name="youtube" size={20} color="#4a3218" onPress={() => Linking.openURL('https://www.youtube.com/@yogiversee')} />
          <Instagram name="instagram" size={20} color="#4a3218" onPress={() => Linking.openURL('https://www.instagram.com/yogiverse.in')} />
          <Email name="email" size={20} color="#4a3218" onPress={()=>navigation.navigate('Contact', {
             title: 'Contact Us',
             api_passData: contact_us_url,
          })}/>
        </View>
      </View>      
     </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4a3218',
  },
  modalBackground: {
    height: '100%',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 60,
    width: 60,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});

export default OldHome;
