import React from 'react';
import {
  View,
  Image,
  Text,
  ToastAndroid,
  AppState,
  TouchableOpacity,
} from 'react-native';
import {GiftedChat, Send, Bubble} from 'react-native-gifted-chat';
import firebase from 'firebase';
import fire from '../../config/firebase';
import Icon from 'react-native-vector-icons/FontAwesome';
import {LocalNotification} from '../../config/notification';
import OneSignal from 'react-native-onesignal'; // Import package from node modules

class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      name: '',
      uid: '',
      url: '',
      userId: '',
      friendUID: '',
      friendName: '',
      friendUrl: '',
      friendStatus: '',
      deviceId: '',
      lastSeen: '',
    };
    this.getUser();
    this.getChat();
    // this.getFriendUser()
    OneSignal.init('8bb71c62-1162-4f51-a278-7d4af43b0ba4');
    OneSignal.addEventListener('received', this.onReceived);
    OneSignal.addEventListener('opened', this.onOpened);
    OneSignal.enableSound(true);
    OneSignal.configure();
  }

  onReceived = notification => {
    console.log('Notification received: ', notification);
  };

  onOpened = openResult => {
    console.log('Message: ', openResult.notification.payload.body);
    console.log('Data: ', openResult.notification.payload.additionalData);
    console.log('isActive: ', openResult.notification.isAppInFocus);
    console.log('openResult: ', openResult);
  };

  getUser = async () => {
    const uid = firebase.auth().currentUser.uid;
    const ref = firebase.database().ref(`/users/${uid}`);
    ref.on('value', snapshot => {
      this.setState({
        name: snapshot.val().name,
        uid: snapshot.val().uid,
        url: snapshot.val().urlImage,
      });
    });
  };

  getFriendUser = async () => {
    const friendUID = await this.props.navigation.getParam('uid');
    const ref = firebase.database().ref(`/users/${friendUID}`);
    ref.on('value', snapshot => {
      console.log(snapshot.val().name);
      this.setState({
        deviceId: snapshot.val().deviceId,
        friendName: `${snapshot.val().name}`,
        friendUrl: `${snapshot.val().urlImage}`,
        friendStatus: `${snapshot.val().status}`,
      });
    });
  };

  getLastSeen = async () => {
    const friendUID = await this.props.navigation.getParam('uid');
    const ref = firebase.database().ref(`/users/${friendUID}`);
    ref.on('value', async snapshot => {
      const date1 = new Date();
      const date2 = new Date(snapshot.val().last_seen);
      var res = Math.abs(date1 - date2) / 1000;
      var minutes = Math.floor(res / 60) % 60;
      this.setState({
        lastSeen: `${minutes}`,
        friendStatus: `${snapshot.val().status}`,
      });
    });
  };
  getPushUserId = () => {
    let userId = OneSignal.getPermissionSubscriptionState(data => {
      console.log('aa', data.userId);
      return data.userId;
    });
    this.setState({userId: userId});
  };

  sendNotification = (data, name) => {
    let headers = {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: 'Basic ZjM2MGZiNjctODM4NS00N2NjLWI3ZGItZDBjZDA0MmZmNjgy',
    };

    let endpoint = 'https://onesignal.com/api/v1/notifications';

    let params = {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        app_id: '8bb71c62-1162-4f51-a278-7d4af43b0ba4',
        include_player_ids: [this.state.deviceId],
        priority: 10,
        contents: {en: data},
        headings: {en: name},
      }),
    };
    fetch(endpoint, params).then(res => console.log(res));
  };
  componentWillMount = () => {
    this.getPushUserId();
    OneSignal.inFocusDisplaying(2);
  };

  componentWillUnmount() {
    OneSignal.removeEventListener('received', this.onReceived);
    OneSignal.removeEventListener('opened', this.onOpened);
    clearInterval(this.interval);
    clearInterval(this.lastSeenInterval);
  }

  getChat = async () => {
    const uid = firebase.auth().currentUser.uid;
    const ref = firebase.database().ref(`/chat/${uid}/${this.state.friendUID}`);
    const ref2 = firebase
      .database()
      .ref(`/chat/${this.state.friendUID}/${uid}`);
    let data = [];
    ref.on('child_added', async snapshot => {
      data.push(snapshot.val().messages);
    });

    ref2.on('child_added', async snapshot => {
      data.push(snapshot.val().messages);
    });

    data = data.sort((a, b) => {
      if (a.createdAt < b.createdAt) {
        return 1;
      } else if (a.createdAt > b.createdAt) {
        return -1;
      }
      return 0;
    });
    this.setState(previousState => ({
      messages: data,
    }));
    // console.log('ggg', data[0].text, this.state.name);
    // LocalNotification(this.state.name, data[0].text);
  };

  async onSend(messages) {
    const {friendUID} = this.state;
    const uid = firebase.auth().currentUser.uid;
    const ref = firebase.database().ref(`/chat/${uid}/${friendUID}/`);
    // const ref2 = firebase.database().ref(`/isread/${uid}/${friendUID}/`)

    await ref.push({
      isRead: 'no',
      messages: {
        _id: Math.floor(Math.random() * 10000000000000) + 1,
        text: messages[0].text,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        user: {
          _id: uid,
          avatar: `${this.state.url}`,
          name: `${this.state.name}`,
        },
      },
    });
    await this.setState(previousState => ({
      messages: GiftedChat.append(previousState.messages, messages),
    }));
    this.sendNotification(messages[0].text, this.state.friendName);
  }

  interval = 0;
  lastSeenInterval = 0;

  async componentDidMount() {
    this.friendId();
    await this.getUser();
    this.getChat();
    this.getFriendUser();
    this.getLastSeen();
    this.interval = setInterval(() => {
      this.getChat();
    }, 2000);
    this.lastSeenInterval = setInterval(() => {
      this.getLastSeen();
    }, 30000);
  }

  friendId = async () => {
    const friendUID = await this.props.navigation.getParam('uid');
    await this.setState({
      friendUID,
    });
  };

  renderSend(props) {
    return (
      <Send {...props}>
        <View style={{marginRight: 15, paddingVertical: 5}}>
          <Icon name="send" size={30} color="pink" />
        </View>
      </Send>
    );
  }

  renderBubble = props => {
    return (
      <Bubble
        {...props}
        textStyle={{
          right: {
            color: '#FAF8F0',
          },
          left: {
            color: '#FAF8F0',
          },
        }}
        wrapperStyle={{
          left: {
            backgroundColor: '#A6E0DE',
          },
          right: {
            backgroundColor: '#F49FB6',
          },
        }}
      />
    );
  };

  render() {
    // console.log('rr', this.state.deviceId);
    return (
      <>
        <View
          style={{
            height: 60,
            backgroundColor: '#F49FB6',
            elevation: 2,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 15,
          }}>
          <Icon
            name="chevron-left"
            size={20}
            color="#FAF8F0"
            onPress={() => this.props.navigation.navigate('Map')}
          />
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() =>
              this.props.navigation.push('Profile', {
                uid: this.state.friendUID,
              })
            }>
            <Image
              source={require('../../assets/user.png')}
              style={{marginLeft: 15, height: 50, width: 50, borderRadius: 50}}
            />
          </TouchableOpacity>
          <View>
            <Text style={{marginLeft: 15, fontSize: 18, color: '#FAF8F0'}}>
              {this.state.friendName}
            </Text>
            <Text style={{marginLeft: 15, fontSize: 12, color: '#FAF8F0'}}>
              {this.state.friendStatus == 'offline'
                ? this.state.lastSeen > '30'
                  ? this.state.friendStatus
                  : `Last Seen ${this.state.lastSeen} minutes ago`
                : this.state.friendStatus}
            </Text>
          </View>
        </View>
        <GiftedChat
          messagesContainerStyle={{backgroundColor: '#FAF8F0'}}
          renderBubble={this.renderBubble}
          renderSend={this.renderSend}
          messages={this.state.messages}
          onSend={messages => this.onSend(messages)}
          user={{
            _id: this.state.uid,
            name: `${this.state.name}`,
            avatar: `${this.state.url}`,
          }}
        />
      </>
    );
  }
}

export default Chat;
