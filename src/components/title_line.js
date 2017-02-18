import React, { Component } from 'react';

class TitleLine extends Component {
  constructor(props) {
    super(props);
    this.handleTitleClick = this.handleTitleClick.bind(this);
    this.handleTodoClick = this.handleTodoClick.bind(this);
  }

  handleTitleClick() {
    this.props.titleClick();
  }

  handleTodoClick(event) {
    event.stopPropagation();
    this.props.todoClick();
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

    return (
      <span onClick={() => this.handleTitleClick()}>
        {todo} {this.props.title} {tail}
      </span>
    );
  }
}

export default TitleLine;
