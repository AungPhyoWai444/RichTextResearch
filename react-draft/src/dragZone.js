import React, { Component } from 'react'
class DragAndDrop extends Component {  
// var  SCOPE  =  'https://www.googleapis.com/auth/drive.file';
// var  discoveryUrl  =  'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
state = {
   name: '',
   googleAuth: '',
   drag: false
  }  
  dropRef = React.createRef()  

initClient = () => {
    try{
      window.gapi.client.init({
          'apiKey': "<YOUR API KEY>",
          'clientId': "<YOUR CLIENT ID>",
          'scope': 'https://www.googleapis.com/auth/drive.file',
          'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
        }).then(() => {
          this.setState({
            googleAuth: window.gapi.auth2.getAuthInstance()
          })
          this.state.googleAuth.isSignedIn.listen(this.updateSigninStatus);


        // document.getElementById('sign
         document.getElementById('signin-btn');
         document.getElementById('signout-btn').addEventListener('click', this.signOutFunction);

      });
    }catch(e){
      console.log(e);
    }
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
  handleClientLoad = ()=>{
    window.gapi.load('client:auth2', this.initClient);
  }
  componentDidMount() {

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
  componentWillUnmount() {
    let div = this.dropRef.current
    div.removeEventListener('dragenter', this.handleDragIn)
    div.removeEventListener('dragleave', this.handleDragOut)
    div.removeEventListener('dragover', this.handleDrag)
    div.removeEventListener('drop', this.handleDrop)
  }  
  render() {
    return (
      <div
        style={{display: 'inline-block', position: 'relative'}}
        ref={this.dropRef}
      >
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
      </div>
    )
  }
}export default DragAndDrop