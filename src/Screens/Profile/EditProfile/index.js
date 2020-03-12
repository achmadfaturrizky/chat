import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Image,
  ActivityIndicator,
  TextInput,
  ImageBackground,
  Picker,
  PermissionsAndroid,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import ImagePicker from 'react-native-image-picker';
import DatePicker from 'react-native-datepicker';
import RNFetchBlob from 'react-native-fetch-blob';
import OneSignal from 'react-native-onesignal'; // Import package from node modules

import NoImage from '../../../assets/No_Image_Available.png';
import firebase from 'firebase';
import fire from '../../../config/firebase';

// Init Firebase

const storage = firebase.storage();
// Prepare Blob support
const Blob = RNFetchBlob.polyfill.Blob;
const fs = RNFetchBlob.fs;
window.XMLHttpRequest = RNFetchBlob.polyfill.XMLHttpRequest;
window.Blob = Blob;

const uploadImage = async (uri, mime = 'application/octet-stream') => {
  const uid = await firebase.auth().currentUser.uid;
  return new Promise((resolve, reject) => {
    const uploadUri = Platform.OS === 'ios' ? uri.replace('file://', '') : uri;
    let uploadBlob = null;
    const imageRef = storage.ref('images/profile-photos').child(`${uid}.jpg`);

    fs.readFile(uploadUri, 'base64')
      .then(data => {
        return Blob.build(data, {type: `${mime};BASE64`});
      })
      .then(blob => {
        uploadBlob = blob;
        return imageRef.put(blob, {contentType: mime});
      })
      .then(() => {
        uploadBlob.close();
        return imageRef.getDownloadURL();
      })
      .then(url => {
        resolve(url);
      })
      .catch(error => {
        reject(error);
      });
  });
};

class EditProfile extends Component {
  constructor(props) {
    super(props);
    OneSignal.init('8bb71c62-1162-4f51-a278-7d4af43b0ba4', {
      kOSSettingsKeyAutoPrompt: false,
    }); // set kOSSettingsKeyAutoPrompt to false prompting manually on iOS

    OneSignal.addEventListener('received', this.onReceived);
    OneSignal.addEventListener('opened', this.onOpened);
    OneSignal.addEventListener('ids', this.onIds);

    this.state = {
      uri: '',
      email: '',
      data: {},
      spesificData: {},
      isLoading: false,
      isLoadingImage: false,
      gender: 'Male',
      name: '',
      dob: '',
      number: '',
      uploadURL: '',
      latitude: '',
      longitude: '',
      lastPosition: '',
      deviceId: '',
    };
    this.getImage();
  }

  async componentDidMount() {
    let data = await firebase.auth().currentUser;
    await this.setState({
      data: data,
      email: data.email,
    });
    await this.getUser();
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

  onOpened(openResult) {
    console.log('Message: ', openResult.notification.payload.body);
    console.log('Data: ', openResult.notification.payload.additionalData);
    console.log('isActive: ', openResult.notification.isAppInFocus);
    console.log('openResult: ', openResult);
  }

  onIds = async device => {
    await this.setState({deviceId: device.userId});
    console.log('Device info: ', device.userId);
  };

  getUser = async () => {
    const uid = firebase.auth().currentUser.uid;
    const ref = firebase.database().ref(`/users/${uid}`);
    ref
      .on('value', snapshot => {
        this.setState({
          spesificData: snapshot.val(),
          name: snapshot.val() != null ? snapshot.val().name : '',
          dob: snapshot.val() != null ? snapshot.val().dob : '',
          number: snapshot.val() != null ? snapshot.val().number : '',
          gender: snapshot.val() != null ? snapshot.val().gender : '',
        });
      })
      .then(res => {
        res
          ? console.log('statedaataa', this.state.spesificData)
          : ToastAndroid.showWithGravity(
              'Insert Your Data',
              ToastAndroid.SHORT,
              ToastAndroid.CENTER,
            );
      })
      .catch(err => {
        console.log(err);
      });
  };

  insertData = async () => {
    const {name, dob, gender, number, uri, deviceId} = this.state;
    const uid = firebase.auth().currentUser.uid;
    const email = firebase.auth().currentUser.email;
    const ref = firebase.database().ref(`/users/${uid}`);
    setTimeout(async () => {
      await ref.set({
        email,
        uid,
        name,
        dob,
        gender,
        deviceId,
        number,
        status: 'online',
        urlImage: '../../../assets/user.png',
        date: new Date().getTime(),
      });
      await this.setState({
        isLoading: false,
      });
      ToastAndroid.showWithGravity(
        'Data Updated',
        ToastAndroid.SHORT,
        ToastAndroid.CENTER,
      );
    }, 3000);
    this.setState({
      isLoading: true,
    });
  };

  _pickImage() {
    this.setState({uploadURL: ''});

    ImagePicker.showImagePicker({}, response => {
      setTimeout(async () => {
        await uploadImage(response.uri)
          .then(url => this.setState({uploadURL: url}))
          .then(response => this.getImage())
          .catch(error => console.log(error))
          .catch(error => console.log(error));
        ToastAndroid.showWithGravity(
          'Photo Updated',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER,
        );
        this.setState({
          isLoadingImage: false,
        });
      }, 8000);
      this.setState({
        isLoadingImage: true,
      });
    });
  }

  getImage = async () => {
    const uid = await firebase.auth().currentUser.uid;
    const ref = await firebase
      .storage()
      .ref('images/profile-photos')
      .child(`${uid}.jpg`);
    const url = await ref.getDownloadURL();
    console.log('uirl', url);
    this.setState({
      uri: url,
    });
    console.log('uririiii', this.state.uri);
  };

  //   componentWillUnmount() {
  //     Geolocation.clearWatch(this.watchID);
  //   }

  render() {
    const {name} = this.state.spesificData || this.state;
    const {email} = this.state;
    return (
      <View style={styles.container}>
        <View
          style={{
            width: '100%',
            flex: 0.7,
            backgroundColor: 'pink',
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 15,
            // borderBottomRightRadius: 30,
          }}>
          {this.state.isLoadingImage ? null : (
            <TouchableOpacity
              style={{alignSelf: 'flex-start', justifyContent: 'flex-start'}}
              onPress={() => this.props.navigation.navigate('SelfProfile')}>
              <Icon
                name="chevron-left"
                style={{alignSelf: 'center'}}
                size={20}
                color="#FAF8F0"
              />
            </TouchableOpacity>
          )}
          <View style={{marginBottom: 6}}>
            {this.state.uri == '' ? (
              <ImageBackground
                source={NoImage}
                style={styles.image}
                imageStyle={{borderRadius: 200}}>
                <TouchableOpacity
                  style={{
                    height: 30,
                    width: 30,
                    borderRadius: 50,
                    backgroundColor: '#F4D2D2',
                    position: 'absolute',
                    top: 70,
                    right: 5,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => this._pickImage()}>
                  <Icon
                    name="camera"
                    style={{alignSelf: 'center'}}
                    size={15}
                    color="#FAF8F0"
                  />
                </TouchableOpacity>
              </ImageBackground>
            ) : (
              <ImageBackground
                source={{uri: this.state.uri}}
                imageStyle={{borderRadius: 200}}
                style={styles.image}>
                <TouchableOpacity
                  style={{
                    height: 30,
                    width: 30,
                    borderRadius: 50,
                    backgroundColor: '#F4D2D2',
                    position: 'absolute',
                    top: 70,
                    right: 5,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 2,
                  }}
                  onPress={() => this._pickImage()}>
                  <Icon
                    name="camera"
                    style={{alignSelf: 'center'}}
                    size={15}
                    color="#FAF8F0"
                  />
                </TouchableOpacity>
              </ImageBackground>
            )}
          </View>
          <Text style={{fontSize: 18, color: '#FAF8F0', marginBottom: 10}}>
            {name ? name : email}
          </Text>
          {this.state.isLoadingImage ? (
            <View style={{marginBottom: 10}}>
              <Text style={{color: '#FAF8F0'}}>Uploading</Text>
              <ActivityIndicator size="large" color="#FAF8F0" />
            </View>
          ) : null}
        </View>

        <View
          style={{
            width: 300,
            // height: 300,
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 30,
          }}>
          <View style={{alignSelf: 'flex-start', width: '100%'}}>
            <Text>Email</Text>
            <TextInput
              editable={false}
              value={email}
              style={{
                borderColor: 'pink',
                borderWidth: 1,
                width: '100%',
                padding: 8,
              }}
            />
          </View>
          <View style={{alignSelf: 'flex-start', width: '100%'}}>
            <Text>Name</Text>
            <TextInput
              style={{
                borderColor: 'pink',
                borderWidth: 1,
                width: '100%',
                padding: 8,
              }}
              value={this.state.name}
              onChangeText={(itemValue, itemIndex) => {
                this.setState({name: itemValue});
              }}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
            }}>
            <View style={{width: '50%'}}>
              <Text>Birth Date</Text>
              <DatePicker
                style={{
                  width: 150,
                  padding: 5,
                  borderColor: 'pink',
                  borderWidth: 1,
                }}
                date={this.state.dob}
                mode="date"
                placeholder="Select date"
                format="YYYY-MM-DD"
                confirmBtnText="Confirm"
                cancelBtnText="Cancel"
                showIcon={false}
                onDateChange={date => {
                  this.setState({dob: date});
                }}
              />
            </View>
            <View style={{width: '40%'}}>
              <Text>Gender</Text>
              {/* <TextInput style={{ borderColor: 'gray', borderWidth: 1,width:'100%',padding:5 }} /> */}
              <Picker
                selectedValue={this.state.gender}
                style={{
                  borderColor: 'pink',
                  borderWidth: 1,
                  width: '100%',
                  padding: 8,
                }}
                onValueChange={itemValue => this.setState({gender: itemValue})}>
                <Picker.Item label="Male" value="male" />
                <Picker.Item label="Female" value="female" />
              </Picker>
            </View>
          </View>
          <View
            style={{alignSelf: 'flex-start', width: '100%', marginBottom: 10}}>
            <Text>Contact Number</Text>
            <TextInput
              value={this.state.number}
              style={{borderColor: 'pink', borderWidth: 1, padding: 8}}
              onChangeText={(itemValue, itemIndex) => {
                this.setState({number: itemValue});
              }}
            />
          </View>

          {this.state.isLoading ? (
            <View style={{justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator size="large" color="pink" />
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => this.insertData()}
              activeOpacity={0.8}
              style={{
                width: 200,
                backgroundColor: 'pink',
                height: 45,
                borderRadius: 50,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{color: '#FAF8F0', fontSize: 18}}>Update Data</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FAF8F0',
  },
  image: {
    height: 120,
    width: 120,
    elevation: 2,
    // resizeMode: 'contain',
    borderRadius: 300,
  },
  upload: {
    textAlign: 'center',
    color: '#333333',
    padding: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'gray',
  },
});

export default EditProfile;
