import React, { Component } from 'react';
import Editor from '@draft-js-plugins/editor';
import createToolbarPlugin  from '@draft-js-plugins/static-toolbar';

import { EditorState } from 'draft-js';

const toolbarPlugin = createToolbarPlugin();

const plugins = [toolbarPlugin,];

export default class UnicornEditor extends Component {
  state = {
    editorState: EditorState.createEmpty(),
  };

  onChange = editorState => {
    this.setState({
      editorState,
    });
  };

  render() {
    return (
      <div className = "DraftEditor">
        <Editor
        editorState={this.state.editorState}
        onChange={this.onChange}
        plugins={plugins}
      />
      </div>
      
    );
  }
}