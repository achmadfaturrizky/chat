import React, {Component} from 'react';
import {
  Text,
  View,
  Image,
  TouchableHighlight,
  TextInput,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import firebase from 'firebase';
import fire from '../../../config/firebase';

export default class Profile extends Component {
  state = {
    name: '',
    uid: '',
    url: '',
    dob: '',
    gender: '',
    number: '',
    status: '',
    lastSeen: '',
    address: '',
  };

  getLastSeen = async () => {
    const uid = await this.props.navigation.getParam('uid');
    const ref = firebase.database().ref(`/users/${uid}`);
    ref.on('value', async snapshot => {
      const date1 = new Date();
      const date2 = new Date(snapshot.val().last_seen);
      var res = Math.abs(date1 - date2) / 1000;
      var minutes = Math.floor(res / 60) % 60;
      this.setState({
        status: `${snapshot.val().status}`,
        lastSeen: `${minutes}`,
      });
    });
  };

  lastSeenInterval = 0;

  async componentDidMount() {
    await this.setState({
      uid: await this.props.navigation.getParam('uid'),
    });
    const ref = firebase.database().ref(`/users/${this.state.uid}`);
    await ref.on('value', async snapshot => {
      console.log('snappppp', snapshot.val());
      const date1 = new Date();
      const date2 = new Date(snapshot.val().last_seen);
      var res = Math.abs(date1 - date2) / 1000;
      var minutes = Math.floor(res / 60) % 60;
      await this.setState({
        name: snapshot.val().name,
        url: snapshot.val().urlImage,
        dob: snapshot.val().dob,
        gender: snapshot.val().gender,
        number: snapshot.val().number,
        status: `${snapshot.val().status}`,
        lastSeen: `${minutes}`,
      });
    });
    this.lastSeenInterval = setInterval(() => {
      this.getLastSeen();
    }, 60000);
  }

  componentWillUnmount() {
    clearInterval(this.lastSeenInterval);
  }

  render() {
    return (
      <View style={{flex: 1, position: 'relative', backgroundColor: '#FAF8F0'}}>
        <View style={{height: 315}}>
          <View
            style={{
              height: 250,
              width: 500,
              backgroundColor: 'pink',
              alignSelf: 'center',
              borderBottomRightRadius: 230,
              borderBottomLeftRadius: 230,
            }}
          />
          <View
            style={{
              height: 125,
              width: 125,
              position: 'absolute',
              top: 160,
              left: 115,
              borderRadius: 125,
              elevation: 20,
            }}>
            <Image
              source={{
                uri: `${this.state.url || null}`,
              }}
              borderRadius={125}
              style={{height: 125, width: 125}}
            />
          </View>
          <Text
            style={{
              position: 'absolute',
              alignSelf: 'center',
              top: 100,
              fontSize: 22,
              color: '#FAF8F0',
            }}>
            {this.state.name}
          </Text>
          <TouchableHighlight
            style={{
              height: 50,
              width: 50,
              backgroundColor: '#FAF8F0',
              elevation: 4,
              borderRadius: 50,
              justifyContent: 'center',
              position: 'absolute',
              top: 200,
              left: 30,
            }}
            onPress={() =>
              this.props.navigation.push('Chat', {
                uid: this.state.uid,
              })
            }
            underlayColor="white"
            activeOpacity={0.5}>
            {/* <Icon name="gear" style={{alignSelf:'center'}} size={30} color="gray" /> */}
            <Icon
              name="comments-o"
              style={{alignSelf: 'center'}}
              size={25}
              color="pink"
            />
          </TouchableHighlight>
          <TouchableHighlight
            onPress={() => this.props.navigation.navigate('Map')}
            style={{
              height: 50,
              width: 50,
              backgroundColor: '#FAF8F0',
              elevation: 4,
              borderRadius: 50,
              justifyContent: 'center',
              position: 'absolute',
              top: 200,
              right: 30,
            }}
            underlayColor="white"
            activeOpacity={0.5}>
            <Icon
              name="map-marker"
              style={{alignSelf: 'center'}}
              size={25}
              color="pink"
            />
          </TouchableHighlight>
          <Text
            style={{
              position: 'absolute',
              bottom: 10,
              alignSelf: 'center',
              fontSize: 12,
              color: 'gray',
            }}>
            {this.state.status == 'offline'
              ? this.state.lastSeen > '30'
                ? this.state.status
                : `Last Seen ${this.state.lastSeen} minutes ago`
              : this.state.status}
          </Text>
        </View>
        <ScrollView style={{position: 'relative', marginBottom: 20}}>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}>
            <TouchableHighlight
              style={{
                height: 40,
                width: 40,
                backgroundColor: '#FAF8F0',
                elevation: 4,
                borderRadius: 50,
                justifyContent: 'center',
                marginBottom: 5,
              }}
              underlayColor="white"
              activeOpacity={0.5}>
              {/* <Icon name="gear" style={{alignSelf:'center'}} size={30} color="gray" /> */}
              <Icon
                name="map-marker"
                style={{alignSelf: 'center'}}
                size={23}
                color="pink"
              />
            </TouchableHighlight>
            <View style={{alignItems: 'center', width: 200, paddingLeft: 30}}>
              <Text style={{fontSize: 16, letterSpacing: 0.5, color: 'gray'}}>
                {this.state.address}
              </Text>
            </View>
          </View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}>
            <TouchableHighlight
              style={{
                height: 40,
                width: 40,
                backgroundColor: '#FAF8F0',
                elevation: 4,
                borderRadius: 50,
                justifyContent: 'center',
                marginBottom: 5,
              }}
              underlayColor="white"
              activeOpacity={0.5}>
              {/* <Icon name="gear" style={{alignSelf:'center'}} size={30} color="gray" /> */}
              <Icon
                name="birthday-cake"
                style={{alignSelf: 'center'}}
                size={23}
                color="pink"
              />
            </TouchableHighlight>
            <Text style={{fontSize: 16, letterSpacing: 0.5, color: 'gray'}}>
              {this.state.dob}
            </Text>
          </View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 10,
            }}>
            <TouchableHighlight
              style={{
                height: 40,
                width: 40,
                backgroundColor: '#FAF8F0',
                elevation: 4,
                borderRadius: 50,
                justifyContent: 'center',
                marginBottom: 5,
              }}
              underlayColor="white"
              activeOpacity={0.5}>
              {/* <Icon name="gear" style={{alignSelf:'center'}} size={30} color="gray" /> */}
              <Icon
                name="odnoklassniki"
                style={{alignSelf: 'center'}}
                size={23}
                color="pink"
              />
            </TouchableHighlight>
            <Text style={{fontSize: 16, letterSpacing: 0.5, color: 'gray'}}>
              {this.state.gender}
            </Text>
          </View>
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <TouchableHighlight
              style={{
                height: 40,
                width: 40,
                backgroundColor: '#FAF8F0',
                elevation: 4,
                borderRadius: 50,
                justifyContent: 'center',
                marginBottom: 5,
              }}
              underlayColor="white"
              activeOpacity={0.5}>
              {/* <Icon name="gear" style={{alignSelf:'center'}} size={30} color="gray" /> */}
              <Icon
                name="address-book"
                style={{alignSelf: 'center'}}
                size={23}
                color="pink"
              />
            </TouchableHighlight>
            <Text style={{fontSize: 16, letterSpacing: 0.5, color: 'gray'}}>
              {this.state.number}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }
}
