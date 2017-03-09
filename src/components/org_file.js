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

    const drawerStyle = {
      position: 'fixed',
      bottom: 10,
      left: 10,
      right: 10,
      height: 80,
      border: '1px solid lightgray',
      backgroundColor: 'white',
      boxShadow: '2px 2px 5px 0px rgba(148,148,148,0.75)',
      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 20,
      boxSizing: 'border-box',
      overflowX: 'auto',
      whiteSpace: 'nowrap'
    };
    const buttonStyle = {
      marginRight: 20
    };
    const drawer = (
      <div style={drawerStyle}>
        <button className={`fa fa-pencil btn btn--circle`} style={buttonStyle}></button>
        <button className={`fa fa-plus btn btn--circle`} style={buttonStyle}></button>
        <button className={`fa fa-pencil-square-o btn btn--circle`} style={buttonStyle}></button>
        <button className={`fa fa-times btn btn--circle`} style={buttonStyle}></button>
        <button className={`fa fa-arrow-up btn btn--circle`} style={buttonStyle}></button>
        <button className={`fa fa-arrow-down btn btn--circle`} style={buttonStyle}></button>
      </div>
    );

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
        {drawer}
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
