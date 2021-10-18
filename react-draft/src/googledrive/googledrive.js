import { Upload } from 'antd';
import React, { Component } from 'react';
import ListDocuments from '../ListDocuments/index';

var SCOPE = 'https://www.googleapis.com/auth/drive.file';
var discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

const documents = [];

export default class GoogleDrive extends Component {
  state = {
    name: '',
    googleAuth: '',
    body:'',
    drag: false
  }
  dropRef = React.createRef()  
  componentDidMount(){
    var script = document.createElement('script');
    script.onload=this.handleClientLoad;
    script.src="https://apis.google.com/js/api.js";
    document.body.appendChild(script);
    
    let div = this.dropRef.current
    div.addEventListener('dragenter', this.handleDragIn)
    div.addEventListener('dragleave', this.handleDragOut)
    div.addEventListener('dragover', this.handleDrag)
    div.addEventListener('drop', this.handleDrop)
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
    await this.state.googleAuth.signIn();
    this.updateSigninStatus()
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
    this.listFiles();
  }

  listFiles = async (searchTerm = null) => {
    window.gapi.client.drive.files
      .list({
        pageSize: 50,
        fields: 'nextPageToken, files(id, name, mimeType, modifiedTime)',
        q: searchTerm,
      })
      .then(function (response) {
        const res = JSON.parse(response.body);
        documents = res.files;
      });
};

  setSigninStatus= async ()=>{
    var user = this.state.googleAuth.currentUser.get().dt;
    this.setState({
        name: user.Ot
      });
       // const boundary='foo_bar_baz'
       const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        var fileName='mychat123.png';
        //var fileData='this is a sample data';
        var contentType='image/png'
        var metadata = {
          'name': fileName,
          'mimeType': contentType
        };
        // var multipartRequestBody =
        //   delimiter +
        //   'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        //   JSON.stringify(metadata) +
        //   delimiter +
        //   'Content-Type: ' + contentType + '\r\n\r\n' +
        //   fileData+'\r\n'+
        //   close_delim;
        var multipartRequestBody =
        delimiter +  'Content-Type: application/jsonrnrn' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + 'rn';

        multipartRequestBody +=  + 'rn' + this.state.body;
        multipartRequestBody += close_delim;

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
  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }
  handleClientLoad = ()=>{
    window.gapi.load('client:auth2', this.initClient);
  }
  handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }  
  handleDragIn = (e) => {
    e.preventDefault()
    e.stopPropagation()
    this.dragCounter++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      this.setState({drag: true})
    }
  }  
  handleDragOut = (e) => {
    e.preventDefault()
    e.stopPropagation()
    this.dragCounter--
    if (this.dragCounter === 0) {
      this.setState({drag: false})
    }
  }  
  handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    this.setState({drag: false})
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this.props.handleDrop(e.dataTransfer.files)
      e.dataTransfer.clearData()
      this.dragCounter = 0    
    }
  }  
  handleChange = async file => {
    let image

    if (file.currentTarget) {
      image = file.currentTarget.currentSrc;
      console.log(file.currentTarget)
    } else {
      if (!file.file.url && !file.file.preview) {
        file.file.preview = await this.getBase64(file.file.originFileObj);
      }
      image = file.file.preview;
      console.log(file.file)
      this.setState({
        body: file.file.preview
      });
    }

    console.log(image)
    
  }
  componentWillUnmount() {
    let div = this.dropRef.current
    div.removeEventListener('dragenter', this.handleDragIn)
    div.removeEventListener('dragleave', this.handleDragOut)
    div.removeEventListener('dragover', this.handleDrag)
    div.removeEventListener('drop', this.handleDrop)
  }  
  render() {
    return (

      <div className="App">
          <Upload 
          style={{width: '100%', height: '200px' }} 
          listType="picture-card" 
          onChange={this.handleChange} >
          <div>
            <div style={{ marginTop: 8 }}>Upload Image</div>
          </div>
        </Upload>
        <div>UserName: <strong>{ this.state.name}</strong></div>
        <button id="signin-btn" onClick= {this.signInFunction}>Sign In</button>
        <button id="signout-btn" onClick={this.signOutFunction}>Sign Out</button>
        <div
        style={{display: 'inline-block', position: 'relative'}}
        ref={this.dropRef} >
        {this.state.dragging &&
          <div 
            style={{
              border: 'dashed grey 4px',
              backgroundColor: 'rgba(255,255,255,.8)',
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0, 
              right: 0,
              zIndex: 9999
            }}
          >
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                right: 0,
                left: 0,
                textAlign: 'center',
                color: 'grey',
                fontSize: 36
              }}
            >
              <div>drop here :)</div>
            </div>
          </div>
        }
        {this.props.children}
        <ListDocuments
                    documents={documents}
                    onSearch={this.listFiles}
                />
      </div>
      </div>
    );
  }
}
