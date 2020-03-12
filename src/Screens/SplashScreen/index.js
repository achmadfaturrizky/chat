// Loading.js
import React from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import firebase from 'firebase';
import OneSignal from 'react-native-onesignal'; // Import package from node modules

export default class Loading extends React.Component {
  constructor(props) {
    super(props);
    OneSignal.init('8bb71c62-1162-4f51-a278-7d4af43b0ba4', {
      kOSSettingsKeyAutoPrompt: false,
    }); // set kOSSettingsKeyAutoPrompt to false prompting manually on iOS

    OneSignal.addEventListener('received', this.onReceived);
    OneSignal.addEventListener('opened', this.onOpened);
    OneSignal.addEventListener('ids', this.onIds);
  }
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      this.props.navigation.navigate(user ? 'Home' : 'Register');
      console.log('sss', user);
    });
  }
  componentWillMount = () => {
    OneSignal.inFocusDisplaying(2);
  };
  componentWillUnmount() {
    OneSignal.removeEventListener('received', this.onReceived);
    OneSignal.removeEventListener('opened', this.onOpened);
    OneSignal.removeEventListener('ids', this.onIds);
  }

  onReceived(notification) {
    console.log('Notification received: ', notification);
  }

  onOpened(openResult, props) {
    console.log('Message: ', openResult.notification.payload.body);
    console.log('Data: ', openResult.notification.payload.additionalData);
    console.log('isActive: ', openResult.notification.isAppInFocus);
    console.log('openResult: ', openResult);
    // this.props.navigation.navigate('ChatList');
  }

  onIds(device) {
    console.log('Device info: ', device);
  }

  render() {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="pink" />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAF8F0',
  },
});
