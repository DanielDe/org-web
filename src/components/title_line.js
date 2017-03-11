import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as orgActions from '../actions/org';

class TitleLine extends Component {
  constructor(props) {
    super(props);
    this.handleTitleClick = this.handleTitleClick.bind(this);
    this.handleTodoClick = this.handleTodoClick.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleTitleFieldClick = this.handleTitleFieldClick.bind(this);

    this.state = {
      titleValue: props.title
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.editMode && !nextProps.editMode) {
      this.props.actions.editHeaderTitle(this.props.headerId, this.state.titleValue);
      this.props.actions.setDirty(true);
    }
  }

  handleTitleClick() {
    this.props.actions.selectHeader(this.props.headerId);
    if (this.props.hasContent) {
      this.props.actions.toggleHeaderOpened(this.props.headerId);
    }
  }

  handleTodoClick(event) {
    event.stopPropagation();
    this.props.todoClick();
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

    return (
      <div className="title-line" onClick={() => this.handleTitleClick()}>
        <div className="header-text">
          {todo} {title}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, props) {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(orgActions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TitleLine);
