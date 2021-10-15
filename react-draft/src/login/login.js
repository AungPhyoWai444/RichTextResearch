import React, { Component } from 'react';
import { createBrowserHistory } from 'history' ;
var SCOPE = 'https://www.googleapis.com/auth/drive.file';
var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const history = createBrowserHistory()

export default class GoogleDrive extends Component {
  state = {
    name: '',
    googleAuth: '',
    body:'',
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
  signInFunction = async () =>{
    await this.state.googleAuth.signIn()
    this.updateSigninStatus()
    history.push("/editor")
  }
  signOutFunction = async ()=>{
    await this.state.googleAuth.signOut();
    window.localStorage.clear();
    this.setState({
      name: ''
    });
  }
  updateSigninStatus = ()=> {
    this.setSigninStatus();
  }
  setSigninStatus= async ()=>{
    var user = this.state.googleAuth.currentUser.get().dt;
    this.setState({
        name: user.Ot,
      });
      
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
