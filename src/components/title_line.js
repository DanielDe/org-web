import React, { Component } from 'react';

class TitleLine extends Component {
  constructor(props) {
    super(props);
    this.handleTitleClick = this.handleTitleClick.bind(this);
    this.handleTodoClick = this.handleTodoClick.bind(this);
    this.handleEditModeClick = this.handleEditModeClick.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleTitleFieldClick = this.handleTitleFieldClick.bind(this);

    this.state = { titleValue: props.title,
                   editMode: false };
  }

  handleTitleClick() {
    this.props.titleClick();
  }

  handleTodoClick(event) {
    event.stopPropagation();
    this.props.todoClick();
  }

  handleEditModeClick(event) {
    event.stopPropagation();
    const newEditMode = !this.state.editMode;
    this.setState({ ...this.state, editMode: newEditMode });

    if (!newEditMode) {
      this.props.titleEdit(this.state.titleValue);
    }
  }

  handleTitleChange(event) {
    this.setState({ ...this.state, titleValue: event.target.value });
  }

  handleTitleFieldClick(event) {
    event.stopPropagation();
  }

  render() {
    let todoKeyword = this.props.todoKeyword;
    if (!todoKeyword) {
      todoKeyword = 'NONE';
    }

    const todoClasses = ['todo-keyword', `todo-keyword--${todoKeyword.toLowerCase()}`];
    const todo = (
      <span onClick={(event) => this.handleTodoClick(event)} className={todoClasses.join(' ')}>
        {todoKeyword}
      </span>
    );

    const tail = (this.props.opened || !this.props.hasContent) ? '' : '...';

    let title = this.props.title;
    if (this.state.editMode) {
      title = <input type="text"
                     autoFocus
                     value={this.state.titleValue}
                     onChange={this.handleTitleChange}
                     onClick={(event) => this.handleTitleFieldClick(event)} />;
    }

    const editButton = (
      <button onClick={(event) => this.handleEditModeClick(event)}>
        {this.state.editMode ? 'Done' : 'Edit'}
      </button>
    );

    return (
      <span onClick={() => this.handleTitleClick()}>
        {todo} {title} {editButton} {tail}
      </span>
    );
  }
}

export default TitleLine;
