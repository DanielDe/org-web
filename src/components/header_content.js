import React, { Component } from 'react';
import HeaderList from './header_list';

class HeaderContent extends Component {
  constructor(props) {
    super(props);
    this.handleAddHeaderClick = this.handleAddHeaderClick.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);

    this.state = { descriptionValue: props.description };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.editMode && !nextProps.editMode) {
      this.props.descriptionEdit(null, this.state.descriptionValue);
    }
  }

  handleAddHeaderClick(parentHeaderId) {
    this.props.addHeader(parentHeaderId);
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
                      titleClick={this.props.titleClick}
                      todoClick={this.props.todoClick}
                      addHeader={this.props.addHeader}
                      openHeader={this.props.openHeader}
                      removeHeader={this.props.removeHeader}
                      titleEdit={(headerId, newTitle) => this.props.titleEdit(headerId, newTitle)}
                      descriptionEdit={(headerId, newDescription) => this.props.descriptionEdit(headerId, newDescription)} />
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

export default HeaderContent;
