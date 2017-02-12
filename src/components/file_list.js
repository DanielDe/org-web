import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dropboxActions from '../actions/dropbox';

class FileList extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleAddFileButton = this.handleAddFileButton.bind(this);
    this.handleFileClick = this.handleFileClick.bind(this);
    this.handleGetFileListButton = this.handleGetFileListButton.bind(this);
  }

  handleAddFileButton() {
    const id = Math.random().toString();
    this.props.actions.addFile('some file ' + id, id);
  }

  handleGetFileListButton() {
    this.props.actions.getFileList();
  }

  handleFileClick(fileId) {
    this.props.actions.selectFile(fileId);

    const selectedFile = this.props.files.filter(file => file.get('id') === fileId).get(0);
    this.props.actions.downloadFile(selectedFile.get('path'));
  }

  render() {
    const fileList = this.props.files.map((file, index) => {
      const className = file.get('selected') ? 'selected' : '';
      return <li className={className} key={index} onClick={() => this.handleFileClick(file.get('id'))}>{file.get('name')}</li>;
    });

    return (
      <div className="FileList">
        <h2>Files:</h2>
        <ol>
          {fileList}
        </ol>
        <button onClick={this.handleAddFileButton}>Add file</button>
        <button onClick={this.handleGetFileListButton}>Get file list</button>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    files: state.dropbox.get('files')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(dropboxActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FileList);
