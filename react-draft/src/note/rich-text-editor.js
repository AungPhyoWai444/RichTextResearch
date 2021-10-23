import React, { useCallback } from "react";
import { EditorState, RichUtils, getDefaultKeyBinding, convertToRaw, convertFromRaw,Modifier} from 'draft-js';
import Editor, { composeDecorators }from '@draft-js-plugins/editor';
import './RichEditor.css'
import '../css/App.css'
import createEmojiPlugin from '@draft-js-plugins/emoji';
import '@draft-js-plugins/emoji/lib/plugin.css';
import createToolbarPlugin from '@draft-js-plugins/static-toolbar';
import DropZone from '../dropzone/drop-zone';
//For Inline styles 
import '@draft-js-plugins/static-toolbar/lib/plugin.css'

import {
    ItalicButton,
    BoldButton,
    UnderlineButton,
    CodeButton,
    HeadlineOneButton,
    HeadlineTwoButton,
    HeadlineThreeButton,
    UnorderedListButton,
    OrderedListButton,
    BlockquoteButton,
    CodeBlockButton,
    SubButton,
    SupButton,
    AlignBlockLeftButton,
    AlignBlockRightButton,
    AlignBlockCenterButton,
    
  } from '@draft-js-plugins/buttons';
  // drag N drop
import createImagePlugin from '@draft-js-plugins/image';
import { gapi } from 'gapi-script';
import createFocusPlugin from '@draft-js-plugins/focus';  
import createBlockDndPlugin from '@draft-js-plugins/drag-n-drop';
import { file } from "@babel/types";
import { Col, Drawer, Row, Button, Input, Table, Tooltip, Spin } from 'antd';
import moment from 'moment';
import { debounce } from 'lodash';
import GoogleDriveImage from '../images/google-drive.png';
const { Search } = Input;

const CLIENT_ID = "547330562057-i3ohfddt12lrmcq4dsljk6qmmcgt4t90.apps.googleusercontent.com";
const API_KEY = "AIzaSyDo9MQj6u3Eftj5Acd9QoY_1BieZDRZ0O8";
// Array of API discovery doc URLs for APIs
const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES ='https://www.googleapis.com/auth/drive.metadata.readonly';

var oldEditorState;
var newEditorState;
var storage = window.localStorage;
const staticToolbarPlugin = createToolbarPlugin();
const { Toolbar } = staticToolbarPlugin;
const emojiPlugin = createEmojiPlugin();
const { EmojiSuggestions} = emojiPlugin;
//drag N Drop
const focusPlugin = createFocusPlugin();
const blockDndPlugin = createBlockDndPlugin();

const decorator = composeDecorators(
    focusPlugin.decorator,
    blockDndPlugin.decorator
  );
const imagePlugin = createImagePlugin({ decorator });
const plugins = [staticToolbarPlugin,emojiPlugin,imagePlugin,blockDndPlugin, focusPlugin];
 
export default class RichEditorExample extends React.Component {
    constructor(props) {
        super(props);
        this.state ={
          documents: [],
          listDocumentsVisible : false,
          setListDocumentsVisibility : false,
          setDocuments :[],
          isLoadingGoogleDriveApi : true,
          isFetchingGoogleDriveFiles : false,
          signedInUser : null,
          setIsLoadingGoogleDriveApi : false,
          setIsFetchingGoogleDriveFiles : false,
          setSignedInUser : null,
          editorState: null,
          showNote: false,
          tasks: [
            {name:"Google File1",category:"wip", bgcolor: "yellow"},
            {name:"Google Sheet", category:"wip", bgcolor:"pink"},
            {name:"Google Ppt", category:"complete", bgcolor:"skyblue"}
          ]
        };
       //this.delta = this.delta.bind(this) 
       const noteData = storage.getItem('noteData');
        console.log( 'noteData:'+noteData);
        if (noteData) {
            this.state.editorState = EditorState.createWithContent(convertFromRaw(JSON.parse(noteData)));
            this.state.showNote = noteData != null ? true : false; 
        } else {
            this.state.editorState = EditorState.createEmpty();
            this.state.showNote = noteData != null ? true : false;
        }
        console.log('state noteData:'+this.state);
        oldEditorState = newEditorState = this.state.editorState;

        //this.focus = () => this.refs.editor.focus();
        this.onChange = (editorState) => { this.setState({ editorState }); newEditorState = editorState; };

        this.handleKeyCommand = this._handleKeyCommand.bind(this);
        this.mapKeyToEditorCommand = this._mapKeyToEditorCommand.bind(this);
        this.toggleBlockType = this._toggleBlockType.bind(this);
        this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
    }

    handleClientLoad = () => {
        gapi.load('client:auth2', this.initClient);
      };
    
    initClient = () => {
        var updateStatus = this;
        this.state.isLoadingGoogleDriveApi = true;
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
        .then(
          function () {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateStatus.updateSigninStatus);
  
            // Handle the initial sign-in state.
            updateStatus.updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
          },
          function (error) {}
        );
    };
  
    handleAuthClick = (event) => {
      this.gapi.auth2.getAuthInstance().signIn();
    };
    handleSignOutClick = (event) => {
      this.state.listDocumentsVisible = false;
      this.gapi.auth2.getAuthInstance().signOut();
    };
    listFiles = (searchTerm = null) => {
      this.state.isFetchingGoogleDriveFiles = true;
      var state = this.state;
      gapi.client.drive.files
        .list({
          pageSize: 50,
          fields: 'nextPageToken, files(id, name, mimeType, modifiedTime)',
          q: searchTerm,
        })
        .then(function (response) {
          state.isFetchingGoogleDriveFiles =false;
          state.listDocumentsVisible = true;
          const res = JSON.parse(response.body);
          state.documents = res.files; 
     
          state.tasks = [
                {name:res.files[0].name,category:"wip", bgcolor: "yellow"},
                {name:res.files[1].name, category:"wip", bgcolor:"pink"},
                {name:res.files[2].name, category:"complete", bgcolor:"skyblue"}
          ];
       
          var tasks = {
            wip: [],
            complete: []
        }
          state.tasks.forEach ((t) => {
           tasks[t.category].push(
                  <div key={t.name} 
                      onDragStart = {(e) => this.onDragStart(e, t)}
                      draggable
                      className="draggable"
                      style = {{backgroundColor: t.bgcolor}}
                  >
                      {t.name}
                  </div>
                   
              );
          });
    console.log("new State::"+state.tasks.length);    
         });
    }
    
    updateSigninStatus = (isSignedIn) => {
      if (isSignedIn) {
        // Set the signed in user
        this.state.signedInUser = gapi.auth2.getAuthInstance().currentUser.get().dt;
        this.state.isLoadingGoogleDriveApi = false;
        // list files if user is authenticated
        this.listFiles();
      } else {
        // prompt user to sign in
        this.handleAuthClick();
      }
    };
    handleDrop = (files) => {
        let fileList = this.state.files
        for (var i = 0; i < files.length; i++) {
          if (!files[i].name) return
          fileList.push(files[i].name)
          console.log('getting file::::'+files);
          var convertedFile = this.getBase64(files[i]);
          //this.uploadFile(convertedFile,files[i]);
          this.uploadFile(files[i])
        }
    
        this.setState({files: fileList})
        
      }
      getBase64(file) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      }
      uploadFile = (file)=>{
        var metadata = {
            name: file.name,
            mimeType: file.type,
           // Please set folderId here.
        };
        var form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], {type: 'application/json'}));
        form.append('file', file);
        fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: new Headers({'Authorization': 'Bearer ' + window.gapi.auth.getToken().access_token}),
          body: form
        }).then((res) => {
          return res.json();
        }).then(function(val) {
          console.log(val);
        });
      }
      
    _handleKeyCommand(command, editorState) {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return true;
        }
        return false;
    }

    _mapKeyToEditorCommand(e) {
        if (e.keyCode === 9 /* TAB */) {
            const newEditorState = RichUtils.onTab(
                e,
                this.state.editorState,
                4, /* maxDepth */
            );
            if (newEditorState !== this.state.editorState) {
                this.onChange(newEditorState);
            }
            return;
        }
        return getDefaultKeyBinding(e);
    }

    _toggleBlockType(blockType) {
        this.onChange(
            RichUtils.toggleBlockType(
                this.state.editorState,
                blockType
            )
        );
    }

    _toggleInlineStyle(inlineStyle) {
        this.onChange(
            RichUtils.toggleInlineStyle(
                this.state.editorState,
                inlineStyle
            )
        );
    }
    // showNote() {
    //     var flag = storage.getItem('noteData') != null ? true : false;
    //     this.setState({
    //         showNote: flag
    //     });
    // }

    onDelete() {
        storage.removeItem('noteData');
        var flag = storage.getItem('noteData') != null ? true : false;
        this.setState({
            showNote: flag
        });
        window.location.reload();
    }

    onCreate() {
        this.setState({
            showNote: true
        });
    }
    onDragStart = (ev, id) => {
      console.log('dragstart:',id);
      ev.dataTransfer.setData("id", id);
      this.setState({editorState: this.insertText(id.name, this.state.editorState)});
      console.log('Editor state:'+this.state.editorState.noteData)
  }

  onDragOver = (ev) => {
      ev.preventDefault();
  }
  insertText = (text, editorState) => {
    const currentContent = editorState.getCurrentContent(),
          currentSelection = editorState.getSelection();

    const newContent = Modifier.replaceText(
      currentContent,
      currentSelection,
      text
    );

    const newEditorState = EditorState.push(editorState, newContent, 'insert-characters');
    return  EditorState.forceSelection(newEditorState, newContent.getSelectionAfter());
  }

  onDrop = (ev, cat) => {
     let id = ev.dataTransfer.getData("id");
     debugger;
     let tasks = this.state.tasks.filter((task) => {
         if (task.name == id) {
             task.category = cat;
         }
         return task;
     });

     this.setState({
         ...this.state,
         tasks
     });
  }
  render() {         
    
    var tasks = {
      wip: [],
      complete: []
  }

  this.state.tasks.forEach ((t) => {
      tasks[t.category].push(
          <div key={t.name} 
              onDragStart = {(e) => this.onDragStart(e, t)}
              draggable
              className="draggable"
              style = {{backgroundColor: t.bgcolor}}
          >
              {t.name}
          </div>
      );
  });

        const { editorState } = this.state;
        console.log('editor state:'+editorState);
        // If the user changes block type before entering any text, we can
        // either style the placeholder or hide it. Let's just hide it now.
        let className = 'RichEditor-editor';
        var contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) {
            if (contentState.getBlockMap().first().getType() !== 'unstyled') {
                className += ' RichEditor-hidePlaceholder';
            }
        }

        return (
            <div>
                  <DropZone handleDrop={this.handleDrop}>   
                <div>
                    {!this.state.showNote &&
                        <button onClick={() => this.onCreate()}>Create Note</button>}

                </div>
                <Spin spinning={this.state.isLoadingGoogleDriveApi} style={{ width: '50%' ,height:'20%'}}>
                <div onClick={() => this.handleClientLoad()} className="source-container">
              <div className="icon-container">
                <div className="icon icon-success">
                  <img src={GoogleDriveImage} width="200" height="200"/>
                </div>
              </div>
            </div>
            </Spin>            
                {this.state.showNote &&
                    (
                        <div className="RichEditor-root">  
                            <div className={className}>
                            
                          
                           <div>
                           <Toolbar>
                            {
              // may be use React.Fragment instead of div to improve perfomance after React 16
                            (externalProps) => (
                                <div>
                                <BoldButton {...externalProps} />
                                <ItalicButton {...externalProps} />
                                <UnderlineButton {...externalProps} />
                                <CodeButton {...externalProps} />
                                <HeadlineOneButton {...externalProps}/>
                                <HeadlineTwoButton {...externalProps}/>
                                <HeadlineThreeButton {...externalProps}/>
                                <UnorderedListButton {...externalProps} />
                                <OrderedListButton {...externalProps} />
                                <BlockquoteButton {...externalProps} />
                                <SubButton {...externalProps} />
                                <SupButton {...externalProps} />
                                <AlignBlockLeftButton {...externalProps} />
                                <AlignBlockCenterButton {...externalProps} />
                                <AlignBlockRightButton {...externalProps} />
                                <CodeBlockButton {...externalProps} />
                
                               </div>
                            )
            }
                            </Toolbar>
                           <Editor
                                    blockStyleFn={getBlockStyle}
                                    customStyleMap={styleMap}
                                    editorState={this.state.editorState}
                                    handleKeyCommand={this.handleKeyCommand}
                                    keyBindingFn={this.mapKeyToEditorCommand}
                                    onChange={this.onChange}
                                    placeholder="Tell a story..."
                                    ref={(element) => {
                                        this.editor = element;
                                      }}
                                    spellCheck={true}
                                    plugins = {plugins}
                            />
                            </div>

                            <EmojiSuggestions />
                          
                            </div>
                        </div>)}

               {/* <div>
               <ul>
               {this.state.tasks.map((user)=><p> {user.name}</p>)}
              </ul>
               </div>          */}
               <div>UserName: <strong>{ this.state.name}</strong></div>
               <div className="container-drag">
                <div className="wip"
                    onDragOver={(e)=>this.onDragOver(e)}
                    onDrop={(e)=>{this.onDrop(e, "wip")}}>
                    <span className="task-header">WIP</span>
                    {tasks.wip}
                </div>
                <div className="droppable" 
                    onDragOver={(e)=>this.onDragOver(e)}
                    onDrop={(e)=>this.onDrop(e, "complete")}>
                     <span className="task-header">COMPLETED</span>
                     {tasks.complete}
                </div>


            </div>
                <div>
                    {this.state.showNote &&
                        (<button onClick={() => this.onDelete()}>Delete Note</button>)}
                </div>
                </DropZone>  
            </div>
        );
    }
}

// Custom overrides for "code" style.
const styleMap = {
    CODE: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
        fontSize: 16,
        padding: 2,
    },
};

function getBlockStyle(block) {
    switch (block.getType()) {
        case 'blockquote': return 'RichEditor-blockquote';
        default: return null;
    }
}

function saveContent(content) {
    storage.setItem('noteData', JSON.stringify(convertToRaw(content)));
    console.log('Save success!');
}

// Save periodically
setInterval(function () {
    if (oldEditorState !== newEditorState) {
        // Initialize newState to oldState
        oldEditorState = newEditorState;

        // Save data to storage
        saveContent(newEditorState.getCurrentContent());
    }
}, 3 * 1000);