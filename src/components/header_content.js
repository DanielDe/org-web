import React, { Component } from 'react';
import HeaderList from './header_list';

class HeaderContent extends Component {
  constructor(props) {
    super(props);
    this.handleAddHeaderClick = this.handleAddHeaderClick.bind(this);
    this.handleEditModeClick = this.handleEditModeClick.bind(this);
    this.handleDescriptionChange = this.handleDescriptionChange.bind(this);

    this.state = { descriptionValue: props.description,
                   editMode: false };
  }

  handleAddHeaderClick(parentHeaderId) {
    this.props.addHeader(parentHeaderId, 'New header!');
  }

  handleEditModeClick(event) {
    event.stopPropagation();
    const newEditMode = !this.state.editMode;
    this.setState({ ...this.state, editMode: newEditMode });

    if (!newEditMode) {
      this.props.descriptionEdit(this.state.descriptionValue);
    }
  }

  handleDescriptionChange(event) {
    this.setState({ ...this.state, descriptionValue: event.target.value });
  }

  render() {
    const editButton = (
      <button onClick={(event) => this.handleEditModeClick(event)}>
        {this.state.editMode ? 'Done' : 'Edit description'}
      </button>
    );

    let description = <div>{this.props.description}</div>;
    if (this.state.editMode) {
      description = <textarea autoFocus
                              value={this.state.descriptionValue}
                              onChange={this.handleDescriptionChange} />;
    }

    let content = '';
    if (this.props.opened) {
      content = (
        <div>
          {description}
          {editButton}

          <HeaderList headers={this.props.subheaders}
                      titleClick={this.props.titleClick}
                      todoClick={this.props.todoClick}
                      addHeader={this.props.addHeader} />
        </div>
      );
    }

    return (
      <div>
        {content}

        <button onClick={() => this.handleAddHeaderClick(this.props.headerId)}>Add header</button>
      </div>
    );
  }
}

export default HeaderContent;
