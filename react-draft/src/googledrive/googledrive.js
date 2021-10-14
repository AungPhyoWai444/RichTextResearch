import React, { Component } from 'react';

var SCOPE = 'https://www.googleapis.com/auth/drive.file';
var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';


export default class GoogleDrive extends Component {
  state = {
    name: '',
    googleAuth: ''
  }
  componentDidMount(){
    var script = document.createElement('script');
    script.onload=this.handleClientLoad;
    script.src="https://apis.google.com/js/api.js";
    document.body.appendChild(script);
  }


  initClient = () => {
    try{
      window.gapi.client.init({
          'apiKey': "AIzaSyDo9MQj6u3Eftj5Acd9QoY_1BieZDRZ0O8",
          'clientId': "547330562057-i3ohfddt12lrmcq4dsljk6qmmcgt4t90.apps.googleusercontent.com",
          'scope': SCOPE,
          'discoveryDocs': [discoveryUrl]
        }).then(() => {
          this.setState({
            googleAuth: window.gapi.auth2.getAuthInstance()
          })
          this.state.googleAuth.isSignedIn.listen(this.updateSigninStatus);
         document.getElementById('signin-btn').addEventListener('click', this.signInFunction);
         document.getElementById('signout-btn').addEventListener('click', this.signOutFunction);

      });
    }catch(e){
      console.log(e);
    }
  }


  signInFunction =()=>{
    this.state.googleAuth.signIn();
    this.updateSigninStatus()
  }

  signOutFunction =()=>{
    this.state.googleAuth.signOut();
    this.updateSigninStatus()
  }

  updateSigninStatus = ()=> {
    this.setSigninStatus();
  }


  setSigninStatus= async ()=>{
    var user = this.state.googleAuth.currentUser.get().user;
    console.log('User::'+user.wc)
    if (user.wc == null){
      this.setState({
        name: ''
      });
    }
    else{
      var isAuthorized = user.hasGrantedScopes(SCOPE);
      console.log('isAuthorized::'+isAuthorized);
      if(isAuthorized){
        this.setState({
          name: user.Ot.Cd
        });
        const boundary='foo_bar_baz'
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        var fileName='mychat123';
        var fileData='this is a sample data';
        var contentType='text/plain'
        var metadata = {
          'name': fileName,
          'mimeType': contentType
        };

        var multipartRequestBody =
          delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          'Content-Type: ' + contentType + '\r\n\r\n' +
          fileData+'\r\n'+
          close_delim;

          console.log('multi request body::'+multipartRequestBody);
          var request = window.gapi.client.request({
            'path': 'https://www.googleapis.com/upload/drive/v3/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': {
              'Content-Type': 'multipart/related; boundary=' + boundary + ''
            },
            'body': multipartRequestBody});
        request.execute(function(file) {
          console.log('file::'+file)
        });
      }
    }
  }

  handleClientLoad = ()=>{
    window.gapi.load('client:auth2', this.initClient);
  }
  render() {
    return (
      <div className="App">
        <div>UserName: <strong>{ this.state.name}</strong></div>
        <button id="signin-btn" onClick= {this.signInFunction}>Sign In</button>
        <button id="signout-btn" onClick={this.signOutFunction}>Sign Out</button>
      </div>
    );
  }
}


