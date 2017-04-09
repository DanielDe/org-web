import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as orgActions from '../actions/org';
import * as dropboxActions from '../actions/dropbox';
import HeaderList from './header_list';

class OrgFile extends Component {
  constructor(props) {
    super(props);
    this.handleAdvanceTodoClick = this.handleAdvanceTodoClick.bind(this);
    this.handleAddHeaderClick = this.handleAddHeaderClick.bind(this);
    this.handleTitleEditModeClick = this.handleTitleEditModeClick.bind(this);
    this.handleDescriptionEditModeClick = this.handleDescriptionEditModeClick.bind(this);
    this.handleRemoveHeaderClick = this.handleRemoveHeaderClick.bind(this);
    this.handleMoveHeaderUpClick = this.handleMoveHeaderUpClick.bind(this);
    this.handleMoveHeaderDownClick = this.handleMoveHeaderDownClick.bind(this);
    this.handleMoveHeaderLeftClick = this.handleMoveHeaderLeftClick.bind(this);
    this.handleMoveHeaderRightClick = this.handleMoveHeaderRightClick.bind(this);
    this.handleMoveTreeLeftClick = this.handleMoveTreeLeftClick.bind(this);
    this.handleMoveTreeRightClick = this.handleMoveTreeRightClick.bind(this);
    this.handleDoneClick = this.handleDoneClick.bind(this);
    this.handlePushClick = this.handlePushClick.bind(this);
    this.handlePullClick = this.handlePullClick.bind(this);
  }

  handleAdvanceTodoClick(headerId) {
    this.props.orgActions.advanceTodoState(this.props.selectedHeaderId);
    this.props.orgActions.syncChanges();
  }

  handleAddHeaderClick() {
    this.props.orgActions.addHeader(this.props.selectedHeaderId);
    this.props.orgActions.syncChanges();

    this.props.orgActions.selectNextSiblingHeader(this.props.selectedHeaderId);
    this.props.orgActions.enterTitleEditMode();
  }

  handleDoneClick() {
    if (this.props.inTitleEditMode) {
      this.props.orgActions.toggleTitleEditMode();
    }
    if (this.props.inDescriptionEditMode) {
      this.props.orgActions.toggleDescriptionEditMode();
    }
  }

  handlePushClick() {
    this.props.dropboxActions.push(this.props.filePath);
  }

  handlePullClick() {
    const pull = () => {
      this.props.dropboxActions.downloadFile(this.props.filePath);
    };

    if (this.props.dirty) {
      if (window.confirm('You have unpushed changes. Are you sure you want to pull?')) {
        pull();
      }
    } else {
      pull();
    }
  }

  handleTitleEditModeClick() {
    this.props.orgActions.toggleTitleEditMode();
  }

  handleDescriptionEditModeClick() {
    this.props.orgActions.toggleDescriptionEditMode();
    this.props.orgActions.openHeader(this.props.selectedHeaderId);
  }

  handleRemoveHeaderClick() {
    if (window.confirm('Are you sure you want to delete this header?')) {
      this.props.orgActions.removeHeader(this.props.selectedHeaderId);
      this.props.orgActions.syncChanges();
    }
  }

  handleMoveHeaderUpClick() {
    this.props.orgActions.moveHeaderUp(this.props.selectedHeaderId);
    this.props.orgActions.syncChanges();
  }

  handleMoveHeaderDownClick() {
    this.props.orgActions.moveHeaderDown(this.props.selectedHeaderId);
    this.props.orgActions.syncChanges();
  }

  handleMoveHeaderLeftClick() {
    this.props.orgActions.moveHeaderLeft(this.props.selectedHeaderId);
    this.props.orgActions.syncChanges();
  }

  handleMoveHeaderRightClick() {
    this.props.orgActions.moveHeaderRight(this.props.selectedHeaderId);
    this.props.orgActions.syncChanges();
  }

  handleMoveTreeLeftClick() {
    this.props.orgActions.moveTreeLeft(this.props.selectedHeaderId);
    this.props.orgActions.syncChanges();
  }

  handleMoveTreeRightClick() {
    this.props.orgActions.moveTreeRight(this.props.selectedHeaderId);
    this.props.orgActions.syncChanges();
  }

  render() {
    let dirtyIndicator = '';
    if (this.props.dirty && !this.props.sampleMode) {
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
    let actionDrawerContents = (
      <div>
        <button className={`fa fa-check-square btn btn--circle ${disabledClass}`}
                style={buttonStyle}
                onClick={() => this.handleAdvanceTodoClick()}></button>
        <button className={`fa fa-pencil btn btn--circle ${disabledClass}`}
                style={buttonStyle}
                onClick={() => this.handleTitleEditModeClick()}></button>
        <button className={`fa fa-pencil-square-o btn btn--circle ${disabledClass}`}
                style={buttonStyle}
                onClick={() => this.handleDescriptionEditModeClick()}></button>
        <button className={`fa fa-plus btn btn--circle ${disabledClass}`}
                style={buttonStyle}
                onClick={() => this.handleAddHeaderClick()}></button>
        <button className={`fa fa-times btn btn--circle ${disabledClass}`}
                style={buttonStyle}
                onClick={() => this.handleRemoveHeaderClick()}></button>
        <button className={`fa fa-arrow-up btn btn--circle ${disabledClass}`}
                style={buttonStyle}
                onClick={() => this.handleMoveHeaderUpClick()}></button>
        <button className={`fa fa-arrow-down btn btn--circle ${disabledClass}`}
                style={buttonStyle}
                onClick={() => this.handleMoveHeaderDownClick()}></button>
        <button className={`fa fa-arrow-left btn btn--circle ${disabledClass}`}
                style={buttonStyle}
                onClick={() => this.handleMoveHeaderLeftClick()}></button>
        <button className={`fa fa-arrow-right btn btn--circle ${disabledClass}`}
                style={buttonStyle}
                onClick={() => this.handleMoveHeaderRightClick()}></button>
        <button className={`fa fa-chevron-left btn btn--circle ${disabledClass}`}
                style={buttonStyle}
                onClick={() => this.handleMoveTreeLeftClick()}></button>
        <button className={`fa fa-chevron-right btn btn--circle ${disabledClass}`}
                style={buttonStyle}
                onClick={() => this.handleMoveTreeRightClick()}></button>
        {!this.props.liveSync && <button className={`fa fa-cloud-upload btn btn--circle`}
                                         style={buttonStyle}
                                         onClick={() => this.handlePushClick()}></button>}
        <button className={`fa fa-cloud-download btn btn--circle`}
                style={buttonStyle}
                onClick={() => this.handlePullClick()}></button>
      </div>
    );
    if (this.props.inTitleEditMode || this.props.inDescriptionEditMode) {
      const doneButtonStyle = {
        width: '100%',
        height: '100%',
        marginLeft: -10
      };
      actionDrawerContents = (
        <button className="btn"
                style={doneButtonStyle}
                onClick={() => this.handleDoneClick()}>Done</button>
      );
    }
    const actionDrawer = (
      <div style={actionDrawerStyle} className="nice-scroll">
        {actionDrawerContents}
      </div>
    );

    let parsingError = this.props.headers.size === 0;
    let mainContent = '';
    if (parsingError) {
      mainContent = (
        <div style={{textAlign: 'center', margin: 10}}>
          Couldn't parse file
        </div>
      );
    } else {
      mainContent = <HeaderList headers={this.props.headers} parentEmpty={false} />;
    }

    return (
      <div>
        {dirtyIndicator}
        <div style={{whiteSpace: 'pre-wrap'}}>
          {mainContent}
        </div>
        {!parsingError && actionDrawer}
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    headers: state.org.get('headers'),
    filePath: state.org.get('filePath'),
    dirty: state.org.get('dirty'),
    selectedHeaderId: state.org.get('selectedHeaderId'),
    sampleMode: state.org.get('sampleMode'),
    inTitleEditMode: state.org.get('inTitleEditMode'),
    inDescriptionEditMode: state.org.get('inDescriptionEditMode'),
    liveSync: state.dropbox.get('liveSync')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    orgActions: bindActionCreators(orgActions, dispatch),
    dropboxActions: bindActionCreators(dropboxActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrgFile);
