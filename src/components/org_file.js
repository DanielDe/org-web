import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as orgActions from '../actions/org';
import * as dropboxActions from '../actions/dropbox';
import HeaderList from './header_list';

class OrgFile extends Component {
  constructor(props) {
    super(props);
    this.handleTodoClick = this.handleTodoClick.bind(this);
    this.handleAddHeader = this.handleAddHeader.bind(this);
    this.handleOpenHeader = this.handleOpenHeader.bind(this);
    this.handleRemoveHeader = this.handleRemoveHeader.bind(this);
    this.handleTitleEdit = this.handleTitleEdit.bind(this);
    this.handleDescriptionEdit = this.handleDescriptionEdit.bind(this);
  }

  handleTodoClick(headerId) {
    this.props.actions.advanceTodoState(headerId);
  }

  handleAddHeader(parentHeaderId) {
    this.props.actions.addHeader(parentHeaderId);
    this.props.actions.openHeader(parentHeaderId);
    this.props.actions.setDirty(true);
  }

  handleOpenHeader(headerId) {
    this.props.actions.openHeader(headerId);
  }

  handleRemoveHeader(headerId) {
    this.props.actions.removeHeader(headerId);
    this.props.actions.setDirty(true);
  }

  handleTitleEdit(headerId, newTitle) {
    this.props.actions.editHeaderTitle(headerId, newTitle);
    this.props.actions.setDirty(true);
  }

  handleDescriptionEdit(headerId, newDescription) {
    this.props.actions.editHeaderDescription(headerId, newDescription);
    this.props.actions.setDirty(true);
  }

  render() {
    let dirtyIndicator = '';
    if (this.props.dirty) {
      const style = {
        padding: 3,
        backgroundColor: 'gray',
        opacity: '0.5',
        color: 'white',
        position: 'fixed',
        bottom: 10,
        right: 10,
        fontWeight: 'bold'
      };
      dirtyIndicator = (
        <div style={style}>Unpushed changes</div>
      );
    }

    return (
      <div>
        {dirtyIndicator}
        <div style={{whiteSpace: 'pre-wrap'}}>
          <HeaderList headers={this.props.parsedFile}
                      todoClick={(headerId) => this.handleTodoClick(headerId)}
                      addHeader={(parentHeaderId) => this.handleAddHeader(parentHeaderId)}
                      titleEdit={(headerId, newTitle) => this.handleTitleEdit(headerId, newTitle)}
                      descriptionEdit={(headerId, newDescription) => this.handleDescriptionEdit(headerId, newDescription)}
                      openHeader={(headerId) => this.handleOpenHeader(headerId)}
                      removeHeader={(headerId) => this.handleRemoveHeader(headerId)} />
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    parsedFile: state.org.get('parsedFile'),
    filePath: state.org.get('filePath'),
    dirty: state.org.get('dirty')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(orgActions, dispatch),
    dropboxActions: bindActionCreators(dropboxActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrgFile);
