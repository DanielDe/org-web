import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as dropboxActions from '../actions/dropbox';

class FileChooser extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.handleFileClick = this.handleFileClick.bind(this);
    this.handleParentDirectoryClick = this.handleParentDirectoryClick.bind(this);
  }

  componentDidMount() {
    // this.props.actions.getFileList();

    // TODO: undo this.
    this.props.actions.downloadFile('/test.org');
  }

  handleFileClick(fileId) {
    const selectedFile = this.props.currentDirectoryListing.filter(file => file.get('id') === fileId).get(0);

    if (selectedFile.get('directory')) {
      this.props.actions.getFileList(selectedFile.get('path'));
    } else {
      this.props.actions.downloadFile(selectedFile.get('path'));
    }
  }

  handleParentDirectoryClick() {
    const pathParts = this.props.currentDirectoryPath.split('/');
    const parentPath = pathParts.slice(0, pathParts.length - 1).join('/');
    this.props.actions.getFileList(parentPath);
  }

  render() {
    let fileList = this.props.currentDirectoryListing.map((file, index) => {
      const isDirectory = file.get('directory');
      return (
        <li className="file-list-element" key={index} onClick={() => this.handleFileClick(file.get('id'))}>
          {file.get('name')}{isDirectory ? '/' : ''}
        </li>
      );
    });

    let directoryPath = this.props.currentDirectoryPath;
    if (directoryPath === '') {
      directoryPath = '/';
    } else {
      const parentDirectoryListing = (
        <li className="file-list-element" key={-1} onClick={() => this.handleParentDirectoryClick()}>
          ..
        </li>
      );
      fileList = [parentDirectoryListing].concat(fileList);
    }

    return (
      <div>
        <h3 className="file-list-header">Directory: {directoryPath}</h3>
        <ul className="file-list">
          {fileList}
        </ul>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    currentDirectoryPath: state.dropbox.get('currentDirectoryPath'),
    currentDirectoryListing: state.dropbox.get('currentDirectoryListing')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(dropboxActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FileChooser);
