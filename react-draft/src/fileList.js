import React, { Component } from 'react'
import DragAndDrop from './dragZone.js'
export default class FileList extends Component {
    state = {
    files: [
      'nice.pdf',
      'verycool.jpg',
      'amazing.png',
      'goodstuff.mp3',
      'thankyou.doc'
    ]
  } 
  handleDrop = (files) => {
    let fileList = this.state.files
    for (var i = 0; i < files.length; i++) {
      if (!files[i].name) return
      fileList.push(files[i].name)
      console.log('getting file::::'+files);
    }
    this.setState({files: fileList})
  }
  render() {
    return (
      <DragAndDrop handleDrop={this.handleDrop}>
        <div style={{height: 300, width: 250}}>
          {this.state.files.map((file) =>
            <div key={file}>{file}</div>
          )}
        </div>
      </DragAndDrop>
    )
  }
}