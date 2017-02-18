import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as orgActions from '../actions/org';
import HeaderList from './header_list';

class OrgFile extends Component {
  constructor(props) {
    super(props);
    this.handleTitleLineClick = this.handleTitleLineClick.bind(this);
    this.handleTodoClick = this.handleTodoClick.bind(this);
    this.handleAddHeader = this.handleAddHeader.bind(this);
  }

  handleTitleLineClick(headerId) {
    this.props.actions.toggleHeaderOpened(headerId);
  }

  handleTodoClick(headerId) {
    this.props.actions.advanceTodoState(headerId);
  }

  handleAddHeader(parentHeaderId, headerText) {
    this.props.actions.addHeader(parentHeaderId, headerText);
  }

  render() {
    return (
      <HeaderList headers={this.props.parsedFile}
                  titleClick={(headerId) => this.handleTitleLineClick(headerId)}
                  todoClick={(headerId) => this.handleTodoClick(headerId)}
                  addHeader={(parentHeaderId, headerText) => this.handleAddHeader(parentHeaderId, headerText)} />
    );
  }
}

function mapStateToProps(state, props) {
  return {
    parsedFile: state.org.get('parsedFile')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(orgActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrgFile);
