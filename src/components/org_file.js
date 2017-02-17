import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as orgActions from '../actions/org';

class OrgFile extends Component {
  constructor(props) {
    super(props);
    this.handleTitleLineClick = this.handleTitleLineClick.bind(this);
    this.handleTodoClick = this.handleTodoClick.bind(this);
  }

  handleTitleLineClick(headerId) {
    this.props.actions.toggleHeaderOpened(headerId);
  }

  handleTodoClick(headerId, event) {
    this.props.actions.advanceTodoState(headerId);
    event.stopPropagation();
  }

  renderHeaderList(headers) {
    if (headers.length === 0) {
      return '';
    }

    const headerListElements = headers.map((header, index) => {
      const title = header.getIn(['titleLine', 'title']);

      let todoKeyword = header.getIn(['titleLine', 'todoKeyword']);
      let todoClasses = ['todo-keyword'];
      if (!todoKeyword) {
        todoKeyword = 'NONE';
      }
      todoClasses.push(`todo-keyword--${todoKeyword.toLowerCase()}`);
      const todo = <span onClick={(event) => this.handleTodoClick(header.get('id'), event)} className={todoClasses.join(' ')}>{todoKeyword}</span>;

      const opened = header.get('opened');

      let content = '';
      if (opened) {
        const description = header.get('description');
        const subheaders = this.renderHeaderList(header.get('subheaders'));

        content = <div>{description} {subheaders}</div>;
      }

      const hasContent = !!header.get('description') || !!header.get('subheaders').size;

      return (
        <li key={index}>
          <span onClick={() => this.handleTitleLineClick(header.get('id'))}>
            {todo} {title} {(opened || !hasContent) ? '' : '...'}
          </span>
          {content}
        </li>
      );
    });

    return <ul>{headerListElements}</ul>;
  }

  render() {
    return (
      <div>{this.renderHeaderList(this.props.parsedFile)}</div>
    );
  }
}

function mapStateToProps(state, props) {
  return {
    parsedFile: state.org.get('parsedFile')
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(orgActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrgFile);
