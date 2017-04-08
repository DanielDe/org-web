import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import AttributedString from './attributed_string';
import * as orgActions from '../actions/org';

class HeaderContent extends Component {
  constructor(props) {
    super(props);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);
    this.handleTextareaBlur = this.handleTextareaBlur.bind(this);

    this.state = { descriptionValue: props.rawDescription };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.editMode && !nextProps.editMode) {
      this.props.actions.editHeaderDescription(this.props.headerId, this.state.descriptionValue);
      this.props.actions.syncChanges();
    }
  }

  handleDescriptionChange(event) {
    this.setState({ ...this.state, descriptionValue: event.target.value });
  }

  handleTextareaBlur() {
    this.props.actions.toggleDescriptionEditMode();
  }

  render() {
    if (!this.props.opened) {
      return <div></div>;
    }

    let description = <div><AttributedString parts={this.props.description} /></div>;
    if (this.props.editMode) {
      description = <textarea autoFocus
                              className="textarea"
                              rows="8"
                              value={this.state.descriptionValue}
                              onBlur={() => this.handleTextareaBlur()}
                              onChange={this.handleDescriptionChange} />;
    }

    return (
      <div>
        <div>
          {description}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(orgActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(HeaderContent);
