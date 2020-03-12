// Login.js
import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import firebase from 'firebase';

export default class Login extends React.Component {
  state = {email: '', password: '', errorMessage: null, isLoading: false};

  errorMessage = async error => {
    await this.setState({
      errorMessage: error.message,
    });
    this.setState({
      errorMessage: null,
      isLoading: false,
    });
  };

  handleLoading = async () => {
    const {email, password} = this.state;
    setTimeout(() => {
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => this.props.navigation.navigate('Home'))
        .catch(error => this.errorMessage(error));
    }, 2000);
    this.setState({
      isLoading: true,
    });
  };

  handleLogin = () => {
    this.handleLoading();
  };
  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#FAF8F0'}}>
        {this.state.errorMessage &&
          ToastAndroid.showWithGravity(
            `${this.state.errorMessage}`,
            ToastAndroid.SHORT,
            ToastAndroid.CENTER,
          )}
        <View style={{height: 200}}>
          <View style={{flexDirection: 'row', position: 'relative'}}>
            <View style={{width: 150, paddingTop: 20, paddingLeft: 30}}>
              <TouchableOpacity
                onPress={() => this.props.navigation.navigate('SignUp')}>
                {/* <Text></Text> */}
                <Text style={{fontSize: 18, color: 'gray'}}>SIGN UP</Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                backgroundColor: 'pink',
                height: 220,
                width: 220,
                borderRadius: 150,
                position: 'absolute',
                right: -35,
                top: -20,
                elevation: 1,
              }}
            />
          </View>
          <View style={{justifyContent: 'flex-end', flex: 1, paddingLeft: 30}}>
            <Text style={{fontSize: 28, color: 'pink'}}>Log In</Text>
          </View>
        </View>
        <View
          style={{
            height: 180,
            justifyContent: 'center',
          }}>
          <View style={{paddingRight: 50}}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#d1d1d1"
              style={{
                borderBottomColor: '#dedede',
                borderBottomWidth: 2,
                paddingVertical: 5,
                paddingLeft: 30,
                fontSize: 16,
              }}
              onChangeText={email => this.setState({email})}
              value={this.state.email}
            />
          </View>
          <View style={{paddingRight: 120, marginTop: 20}}>
            <TextInput
              secureTextEntry={true}
              placeholder="Password"
              placeholderTextColor="#d1d1d1"
              style={{
                borderBottomColor: '#dedede',
                borderBottomWidth: 2,
                paddingVertical: 5,
                paddingLeft: 30,
                fontSize: 16,
                marginBottom: 10,
              }}
              onChangeText={password => this.setState({password})}
              value={this.state.password}
            />
          </View>
          <TouchableOpacity style={{paddingLeft: 30}}>
            <Text style={{color: 'gray', fontSize: 12}}>Forgot password?</Text>
          </TouchableOpacity>
        </View>
        <View style={{height: 240}}>
          {this.state.isLoading ? (
            <View style={{alignSelf: 'center'}}>
              <ActivityIndicator size="large" color="pink" />
            </View>
          ) : (
            <View style={{alignSelf: 'flex-end'}}>
              <TouchableOpacity
                style={{
                  height: 65,
                  width: 150,
                  backgroundColor: 'pink',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderTopLeftRadius: 15,
                  borderBottomLeftRadius: 15,
                }}
                onPress={this.handleLogin}>
                <Text style={{color: 'white', fontSize: 18}}>Let's Chat!</Text>
              </TouchableOpacity>
            </View>
          )}
          {/* <Image source={Logo} style={{position:'absolute'}} height={250} width={210}/> */}
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    height: 40,
    width: '90%',
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 8,
  },
});
