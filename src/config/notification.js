import PushNotification from 'react-native-push-notification';

PushNotification.configure({
  // (required) Called when a remote or local notification is opened or received
  onNotification: function(notification) {
    console.log('LOCAL NOTIFICATION ==>', notification);
  },
  popInitialNotification: true,
  requestPermissions: true,
});

export const LocalNotification = (name, text) => {
  PushNotification.localNotification({
    autoCancel: true,
    bigText: text,
    subText: 'Local Notification Demo',
    title: name,
    message: text,
    vibrate: true,
    vibration: 300,
    playSound: true,
    soundName: 'default',
    // actions: '["Yes", "No"]',
  });
};
