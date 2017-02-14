import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as orgActions from '../actions/org';

class OrgFile extends Component {
  constructor(props) {
    super(props);
    this.handleTitleLineClick = this.handleTitleLineClick.bind(this);
  }

  handleTitleLineClick(headerId) {
    this.props.actions.toggleHeaderOpened(headerId);
  }

  renderHeaderList(headers) {
    if (headers.length === 0) {
      return '';
    }

    const headerListElements = headers.map((header, index) => {
      const title = header.getIn(['titleLine', 'title']);
      let todoKeyword = header.getIn(['titleLine', 'todoKeyword']);
      if (todoKeyword) {
        if (todoKeyword === 'TODO') {
          todoKeyword = <span className='todo-keyword todo-keyword--todo'>{todoKeyword}</span>;
        } else {
          todoKeyword = <span className='todo-keyword todo-keyword--done'>{todoKeyword}</span>;
        }
      }
      const opened = header.get('opened');

      let content = '';
      if (opened) {
        const description = header.get('description');
        const subheaders = this.renderHeaderList(header.get('subheaders'));

        content = <div>{description} {subheaders}</div>;
      }

      return (
        <li key={index}>
          <span onClick={() => this.handleTitleLineClick(header.get('id'))}>{todoKeyword} {title} {opened ? '' : '...'}</span>
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
