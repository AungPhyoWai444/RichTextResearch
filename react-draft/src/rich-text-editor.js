import React from "react";
import { EditorState, RichUtils, getDefaultKeyBinding, convertToRaw, convertFromRaw } from 'draft-js';
import Editor, { composeDecorators }from '@draft-js-plugins/editor';
import './RichEditor.css'
import createEmojiPlugin from '@draft-js-plugins/emoji';
import toolbarStyles from './css/toolbarStyles.css';

import '@draft-js-plugins/emoji/lib/plugin.css';
import createToolbarPlugin from '@draft-js-plugins/static-toolbar';
import GoogleDrive from './googledrive/googledrive.js';
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
var oldEditorState;
var newEditorState;
var storage = window.localStorage;
const staticToolbarPlugin = createToolbarPlugin();
const { Toolbar } = staticToolbarPlugin;
const emojiPlugin = createEmojiPlugin();
const { EmojiSuggestions,EmojiSelect } = emojiPlugin;
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
    // state = {
    //     files: [
    //       'hello.doc'
    //     ]
    //   } 
    constructor(props) {
        super(props);
        //this.state = { showNote: storage.getItem('noteData') != null ? true : false };

        const noteData = storage.getItem('noteData');
        console.log( 'noteData:'+noteData);
        if (noteData) {
            this.state = {
                editorState: EditorState.createWithContent(convertFromRaw(JSON.parse(noteData))),
                showNote: noteData != null ? true : false,
                files: [
                    'hello.doc'
                  ]
            };
           
        } else {
            this.state = { editorState: EditorState.createEmpty(), showNote: noteData != null ? true : false,
                files: [
                    'hello.doc'
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
        for (var i = 0; i < files.length; i++) {
          if (!files[i].name) return
          fileList.push(files[i].name)
          console.log('getting file::::'+files);
        }
        this.setState({files: fileList})
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
                <div>
                    {!this.state.showNote &&
                        <button onClick={() => this.onCreate()}>Create Note</button>}

                </div>
                {this.state.showNote &&
                    (
                        <div className="RichEditor-root">
                            {/* <BlockStyleControls
                                editorState={editorState}
                                onToggle={this.toggleBlockType}
                            /> */}
                            {/* <InlineStyleControls
                                editorState={editorState}
                                onToggle={this.toggleInlineStyle}
                            /> */}
                           
                            <div className={className}>
                            {/* <div className={emojiStyles.options}>
                            <EmojiSelect closeOnEmojiSelect/>
                            </div> */}
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
                                {/* <EmojiSelect closeOnEmojiSelect className={toolbarStyles.emoji}/> */}
                                {/* <div className={toolbarStyles.emoji}>
                                <EmojiSelect closeOnEmojiSelect />
                                </div> */}
                               </div>
                            )
            }
                            </Toolbar>
                            <GoogleDrive handleDrop={this.handleDrop}>

                           <div>
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
                            <div style={{height: 300, width: 250}}>
                            {this.state.files.map((file) =>
                                <div key={file}>{file}</div>
                            )}
                            </div>
                            </GoogleDrive>
                            <EmojiSuggestions />
                          
                            </div>
                        </div>)}
                <div>
                    {this.state.showNote &&
                        (<button onClick={() => this.onDelete()}>Delete Note</button>)}
                </div>
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

class StyleButton extends React.Component {
    constructor() {
        super();
        this.onToggle = (e) => {
            e.preventDefault();
            this.props.onToggle(this.props.style);
        };
    }

    render() {
        let className = 'RichEditor-styleButton';
        if (this.props.active) {
            className += ' RichEditor-activeButton';
        }

        return (
            <span className={className} onMouseDown={this.onToggle}>
                {this.props.label}
            </span>
        );
    }
}

const BLOCK_TYPES = [
    { label: 'H1', style: 'header-one' },
    { label: 'H2', style: 'header-two' },
    { label: 'H3', style: 'header-three' },
    { label: 'H4', style: 'header-four' },
    { label: 'H5', style: 'header-five' },
    { label: 'H6', style: 'header-six' },
    { label: 'Blockquote', style: 'blockquote' },
    { label: 'UL', style: 'unordered-list-item' },
    { label: 'OL', style: 'ordered-list-item' },
    { label: 'Code Block', style: 'code-block' },
];

const BlockStyleControls = (props) => {
    const { editorState } = props;
    const selection = editorState.getSelection();
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

    return (
        <div className="RichEditor-controls">
            {BLOCK_TYPES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={type.style === blockType}
                    label={type.label}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </div>
    );
};

var INLINE_STYLES = [
    { label: 'Bold', style: 'BOLD'},
    { label: 'Italic', style: 'ITALIC'},
    { label: 'Underline', style: 'UNDERLINE'},
    { label: 'Monospace', style: 'CODE' },
];

const InlineStyleControls = (props) => {
    const currentStyle = props.editorState.getCurrentInlineStyle();

    return (
        <div className="RichEditor-controls">
            {INLINE_STYLES.map((type) =>
                <StyleButton
                    key={type.label}
                    active={currentStyle.has(type.style)}
                    label={type.icon}
                    onToggle={props.onToggle}
                    style={type.style}
                />
            )}
        </div>
    );
};