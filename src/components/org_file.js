import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as orgActions from '../actions/org';
import * as dropboxActions from '../actions/dropbox';
import HeaderList from './header_list';

class OrgFile extends Component {
  constructor(props) {
    super(props);
    this.handleTitleLineClick = this.handleTitleLineClick.bind(this);
    this.handleTodoClick = this.handleTodoClick.bind(this);
    this.handleAddHeader = this.handleAddHeader.bind(this);
    this.handleOpenHeader = this.handleOpenHeader.bind(this);
    this.handleRemoveHeader = this.handleRemoveHeader.bind(this);
    this.handlePushClick = this.handlePushClick.bind(this);
    this.handleTitleEdit = this.handleTitleEdit.bind(this);
    this.handleDescriptionEdit = this.handleDescriptionEdit.bind(this);
  }

  handleTitleLineClick(headerId) {
    this.props.actions.toggleHeaderOpened(headerId);
  }

  handleTodoClick(headerId) {
    this.props.actions.advanceTodoState(headerId);
  }

  handleAddHeader(parentHeaderId, headerText) {
    this.props.actions.addHeader(parentHeaderId, headerText);
    this.props.actions.openHeader(parentHeaderId);
  }

  handleOpenHeader(headerId) {
    this.props.actions.openHeader(headerId);
  }

  handleRemoveHeader(headerId) {
    this.props.actions.removeHeader(headerId);
  }

  handlePushClick() {
    this.props.dropboxActions.push(this.props.filePath);
  }

  handleTitleEdit(headerId, newTitle) {
    this.props.actions.editHeaderTitle(headerId, newTitle);
  }

  handleDescriptionEdit(headerId, newDescription) {
    this.props.actions.editHeaderDescription(headerId, newDescription);
  }

  render() {
    return (
      <div style={{whiteSpace: 'pre-wrap'}}>
        <HeaderList headers={this.props.parsedFile}
                    titleClick={(headerId) => this.handleTitleLineClick(headerId)}
                    todoClick={(headerId) => this.handleTodoClick(headerId)}
                    addHeader={(parentHeaderId, headerText) => this.handleAddHeader(parentHeaderId, headerText)}
                    titleEdit={(headerId, newTitle) => this.handleTitleEdit(headerId, newTitle)}
                    descriptionEdit={(headerId, newDescription) => this.handleDescriptionEdit(headerId, newDescription)}
                    openHeader={(headerId) => this.handleOpenHeader(headerId)}
                    removeHeader={(headerId) => this.handleRemoveHeader(headerId)} />
        <button onClick={() => this.handlePushClick()}>Push to Dropbox</button>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    parsedFile: state.org.get('parsedFile'),
    filePath: state.org.get('filePath')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(orgActions, dispatch),
    dropboxActions: bindActionCreators(dropboxActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrgFile);
