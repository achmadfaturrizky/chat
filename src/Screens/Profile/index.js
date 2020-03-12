import React, {Component} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import firebase from 'firebase';

class Profile extends Component {
  render() {
    return (
      <View>
        <TouchableOpacity onPress={() => firebase.auth().signOut()}>
          <Text>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
export default Profile;
