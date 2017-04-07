import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
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

    const descriptionParts = this.props.description.map(part => {
      if (part.type === 'text') {
        return part.contents;
      } else if (part.type === 'link') {
        const uri = part.contents.uri;
        const title = part.contents.title || uri;

        return <a key={Math.random()} href={uri}>{title}</a>;
      } else {
        console.error(`Unrecognized description part type: ${part.type}`);
        return '';
      }
    });
    let description = <div>{descriptionParts}</div>;
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
