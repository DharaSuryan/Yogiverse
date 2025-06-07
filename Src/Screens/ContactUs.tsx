import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import WebView from 'react-native-webview';


function ContactUs({ route, navigation }:any) {
  const { title, api_passData } = route.params;
  const [isLoading, setisLoading] = useState(true);


  const ActivityIndicatorElement = () => {
    return (
      <View style={styles.modalBackground}>
        <ActivityIndicator
          size="large"
        //   color={COLORS.colorPrimary}
          animating={true}
          style={styles.activityIndicatorWrapper}
        />
      </View>

    );
  }
  return (
    <View style={{ flex: 1,  }}>
     
      <WebView
        startInLoadingState={true}
        originWhitelist={['*']}
        renderLoading={ActivityIndicatorElement}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scalesPageToFit={true}
        source={{ uri: api_passData }}
      />
    </View >
  );
}
const styles = StyleSheet.create({
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
export default ContactUs;
