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
    this.handleAddHeaderClick = this.handleAddHeaderClick.bind(this);
    this.handleRemoveHeader = this.handleRemoveHeader.bind(this);
    this.handleTitleEditModeClick = this.handleTitleEditModeClick.bind(this);
    this.handleDescriptionEdit = this.handleDescriptionEdit.bind(this);
  }

  handleTodoClick(headerId) {
    this.props.orgActions.advanceTodoState(headerId);
  }

  handleAddHeaderClick() {
    this.props.orgActions.addHeader(this.props.selectedHeaderId);
    this.props.orgActions.openHeader(this.props.selectedHeaderId);
    this.props.orgActions.setDirty(true);
  }

  handleRemoveHeader(headerId) {
    this.props.orgActions.removeHeader(headerId);
    this.props.orgActions.setDirty(true);
  }

  handleDescriptionEdit(headerId, newDescription) {
    this.props.orgActions.editHeaderDescription(headerId, newDescription);
    this.props.orgActions.setDirty(true);
  }

  handleTitleEditModeClick() {
    this.props.orgActions.toggleTitleEditMode();
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
        bottom: 100,
        right: 10,
        fontWeight: 'bold'
      };
      dirtyIndicator = (
        <div style={style}>Unpushed changes</div>
      );
    }

    const disabledClass = this.props.selectedHeaderId ? '' : 'btn--disabled';
    const actionDrawerStyle = {
      position: 'fixed',
      bottom: 10,
      left: 10,
      right: 10,
      height: 80,
      border: '1px solid lightgray',
      backgroundColor: 'white',
      boxShadow: '2px 2px 5px 0px rgba(148,148,148,0.75)',
      paddingTop: 9,
      paddingBottom: 6,
      paddingLeft: 20,
      boxSizing: 'border-box',
      overflowX: 'auto',
      whiteSpace: 'nowrap'
    };
    const buttonStyle = {
      marginRight: 20
    };
    const actionDrawer = (
      <div style={actionDrawerStyle} className="nice-scroll">
        <button className={`fa fa-check-square btn btn--circle ${disabledClass}`}
                style={buttonStyle}></button>
        <button className={`fa fa-pencil btn btn--circle ${disabledClass}`}
                style={buttonStyle}
                onClick={() => this.handleTitleEditModeClick()}></button>
        <button className={`fa fa-pencil-square-o btn btn--circle ${disabledClass}`}
                style={buttonStyle}></button>
        <button className={`fa fa-plus btn btn--circle ${disabledClass}`}
                style={buttonStyle}
                onClick={() => this.handleAddHeaderClick()}></button>
        <button className={`fa fa-times btn btn--circle ${disabledClass}`}
                style={buttonStyle}></button>
        <button className={`fa fa-arrow-up btn btn--circle ${disabledClass}`}
                style={buttonStyle}></button>
        <button className={`fa fa-arrow-down btn btn--circle ${disabledClass}`}
                style={buttonStyle}></button>
      </div>
    );

    return (
      <div>
        {dirtyIndicator}
        <div style={{whiteSpace: 'pre-wrap'}}>
          <HeaderList headers={this.props.parsedFile}
                      todoClick={(headerId) => this.handleTodoClick(headerId)}
                      descriptionEdit={(headerId, newDescription) => this.handleDescriptionEdit(headerId, newDescription)}
                      removeHeader={(headerId) => this.handleRemoveHeader(headerId)} />
        </div>
        {actionDrawer}
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    parsedFile: state.org.get('parsedFile'),
    filePath: state.org.get('filePath'),
    dirty: state.org.get('dirty'),
    selectedHeaderId: state.org.get('selectedHeaderId')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    orgActions: bindActionCreators(orgActions, dispatch),
    dropboxActions: bindActionCreators(dropboxActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrgFile);
