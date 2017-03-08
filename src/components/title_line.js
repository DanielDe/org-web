import React, { Component } from 'react';

class TitleLine extends Component {
  constructor(props) {
    super(props);
    this.handleTitleClick = this.handleTitleClick.bind(this);
    this.handleTodoClick = this.handleTodoClick.bind(this);
    this.handleDrawerButtonClick = this.handleDrawerButtonClick.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleTitleFieldClick = this.handleTitleFieldClick.bind(this);

    this.state = {
      titleValue: props.title
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.editMode && !nextProps.editMode) {
      this.props.titleEdit(this.state.titleValue);
    }
  }

  handleTitleClick() {
    this.props.titleClick();
  }

  handleTodoClick(event) {
    event.stopPropagation();
    this.props.todoClick();
  }

  handleDrawerButtonClick(event) {
    event.stopPropagation();
    this.props.actionDrawerToggle();
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

    let title = <span style={{fontWeight: 'bold'}}>{this.props.title} {tail}</span>;
    if (this.props.editMode) {
      title = <input type="text"
                     autoFocus
                     value={this.state.titleValue}
                     onChange={this.handleTitleChange}
                     onClick={(event) => this.handleTitleFieldClick(event)} />;
    }

    const drawerButton = (
      <div className="drawer-container"
           style={{borderLeft: '1px solid lightgray'}}
           onClick={(event) => this.handleDrawerButtonClick(event)}>
        <i className={`fa fa-bars`}></i>
      </div>
    );

    return (
      <div className="title-line" onClick={() => this.handleTitleClick()}>
        <div className="header-text">
          {todo} {title}
        </div>
        {drawerButton}
      </div>
    );
  }
}

export default TitleLine;
