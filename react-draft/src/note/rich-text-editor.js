import React from "react";
import { EditorState, RichUtils, getDefaultKeyBinding, convertToRaw, convertFromRaw } from 'draft-js';
import Editor, { composeDecorators }from '@draft-js-plugins/editor';
import './RichEditor.css'
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

import createFocusPlugin from '@draft-js-plugins/focus';  
import createBlockDndPlugin from '@draft-js-plugins/drag-n-drop';
import { file } from "@babel/types";

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
        const noteData = storage.getItem('noteData');
        console.log( 'noteData:'+noteData);
        if (noteData) {
            this.state = {
                editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(noteData))),
                showNote: noteData != null ? true : false,
                files: [
                    'hello.doc'
                  ],
                finalSpaceCharacters : [
                    {
                      id: 'gary',
                      name: 'Gary Goodspeed',
                      thumb: '/images/gary.png'
                    },
                    {
                      id: 'cato',
                      name: 'Little Cato',
                      thumb: '/images/cato.png'
                    },
                    {
                      id: 'kvn',
                      name: 'KVN',
                      thumb: '/images/kvn.png'
                    },
                    {
                      id: 'mooncake',
                      name: 'Mooncake',
                      thumb: '/images/mooncake.png'
                    },
                    {
                      id: 'quinn',
                      name: 'Quinn Ergon',
                      thumb: '/images/quinn.png'
                    }
                  ]
            };
           
        } else {
            this.state = { editorState: EditorState.createEmpty(), showNote: noteData != null ? true : false,
                files: [
                    'hello.doc'
                  ],
                  finalSpaceCharacters : [
                    {
                      id: 'gary',
                      name: 'Gary Goodspeed',
                      thumb: '/images/gary.png'
                    },
                    {
                      id: 'cato',
                      name: 'Little Cato',
                      thumb: '/images/cato.png'
                    },
                    {
                      id: 'kvn',
                      name: 'KVN',
                      thumb: '/images/kvn.png'
                    },
                    {
                      id: 'mooncake',
                      name: 'Mooncake',
                      thumb: '/images/mooncake.png'
                    },
                    {
                      id: 'quinn',
                      name: 'Quinn Ergon',
                      thumb: '/images/quinn.png'
                    }
                  ]};
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

    handleDrop = (files) => {
        let fileList = this.state.files
        debugger;
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

  
    //   const [characters, updateCharacters] = useState(finalSpaceCharacters);
    //   handleOnDragEnd(result) {
    //     if (!result.destination) return;
    
    //     const items = Array.from();
    //     const [reorderedItem] = items.splice(result.source.index, 1);
    //     items.splice(result.destination.index, 0, reorderedItem);
    
    //     this.setState({
    //         finalSpaceCharacters: items
    //     });
    //   }
    render() {
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
                            /></div>
                            
                            
                            <EmojiSuggestions />
                          
                            </div>
                        </div>)}
                        <div style={{height: 300, width: 250}}>
                            {this.state.files.map((file) =>
                                <div key={file}>{file}</div>
                            )}
                            
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