import React from 'react';
import {createStackNavigator} from 'react-navigation-stack';

import {BottomNavigator} from './bottomNavigator';
import Login from '../Screens/Auth/Login';
import Register from '../Screens/Auth/Register';
import Chat from '../Screens/Chat';
import ChatList from '../Screens/ChatList';
import Profile from '../Screens/Profile/Profile';
import EditProfile from '../Screens/Profile/EditProfile';
import SelfProfile from '../Screens/Profile/SelfProfile';

export default createStackNavigator({
  Home: {
    screen: BottomNavigator,
    navigationOptions: {
      headerShown: false,
    },
  },
  Login: {
    screen: Login,
    navigationOptions: {
      headerShown: false,
    },
  },
  Register: {
    screen: Register,
    navigationOptions: {
      headerShown: false,
    },
  },
  Chat: {
    screen: Chat,
    navigationOptions: {
      headerShown: false,
    },
  },
  ChatList: {
    screen: ChatList,
    navigationOptions: {
      headerShown: false,
    },
  },
  Profile: {
    screen: Profile,
    navigationOptions: {
      headerShown: false,
    },
  },
  SelfProfile: {
    screen: SelfProfile,
    navigationOptions: {
      headerShown: false,
    },
  },
  EditProfile: {
    screen: EditProfile,
    navigationOptions: {
      headerShown: false,
    },
  },
});
