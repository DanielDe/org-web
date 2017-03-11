import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as orgActions from '../actions/org';
import HeaderList from './header_list';

class HeaderContent extends Component {
  constructor(props) {
    super(props);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);

    this.state = { descriptionValue: props.description };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.editMode && !nextProps.editMode) {
      this.props.actions.editHeaderDescription(this.props.headerId, this.state.descriptionValue);
      this.props.actions.setDirty(true);
    }
  }

  handleDescriptionChange(event) {
    this.setState({ ...this.state, descriptionValue: event.target.value });
  }

  render() {
    let description = <div>{this.props.description}</div>;
    if (this.props.editMode) {
      description = <textarea autoFocus
                              value={this.state.descriptionValue}
                              onChange={this.handleDescriptionChange} />;
    }

    let content = '';
    if (this.props.opened) {
      content = (
        <div>
          {description}

          <HeaderList headers={this.props.subheaders}
                      todoClick={this.props.todoClick}
                      removeHeader={this.props.removeHeader} />
        </div>
      );
    }

    return (
      <div>
        {content}
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
