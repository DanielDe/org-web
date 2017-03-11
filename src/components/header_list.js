import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as orgActions from '../actions/org';
import TitleLine from './title_line';
import HeaderContent from './header_content';
import Immutable from 'immutable';

class HeaderList extends Component {
  constructor(props) {
    super(props);
    this.handleTitleLineClick = this.handleTitleLineClick.bind(this);
    this.handleTodoClick = this.handleTodoClick.bind(this);
    this.handleRemoveHeader = this.handleRemoveHeader.bind(this);
    this.handleActionDrawerToggle = this.handleActionDrawerToggle.bind(this);

    this.state = {
      headersShowingActionDrawer: new Immutable.List(),
      newHeaderJustAdded: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.headers.size === this.props.headers.size + 1) {
      this.setState({ newHeaderJustAdded: true });
    }
  }

  componentDidUpdate() {
    if (this.state.newHeaderJustAdded) {
      this.setState({ newHeaderJustAdded: false });
      this.lastHeader.scrollIntoView(true);
    }
  }

  handleTitleLineClick(headerId, hasContent) {
    this.props.actions.selectHeader(headerId);
    if (hasContent) {
      this.props.actions.toggleHeaderOpened(headerId);
    }
  }

  handleTodoClick(headerId) {
    this.props.todoClick(headerId);
  }

  handleRemoveHeader(headerId) {
    if (window.confirm('Are you sure you want to delete this header?')) {
      this.props.removeHeader(headerId);
    }
  }

  handleActionDrawerToggle(headerId) {
    const headersShowingActionDrawer = this.state.headersShowingActionDrawer;
    if (headersShowingActionDrawer.includes(headerId)) {
      this.setState({
        headersShowingActionDrawer: headersShowingActionDrawer.delete(headersShowingActionDrawer.indexOf(headerId))
      });
    } else {
      this.setState({
        headersShowingActionDrawer: headersShowingActionDrawer.push(headerId)
      });
    }
  }

  render() {
    if (this.props.headers.length === 0) {
      return <div></div>;
    }

    const headerListElements = this.props.headers.map((header, index) => {
      const headerId = header.get('id');
      const title = header.getIn(['titleLine', 'title']);
      let todoKeyword = header.getIn(['titleLine', 'todoKeyword']);
      const opened = header.get('opened');
      const hasContent = !!header.get('description') || !!header.get('subheaders').size;
      const isSelected = headerId === this.props.selectedHeaderId;
      const inTitleEditMode = isSelected && this.props.inTitleEditMode;
      const inDescriptionEditMode = isSelected && this.props.inDescriptionEditMode;

      let actionDrawer = null;
      if (this.state.headersShowingActionDrawer.includes(headerId)) {
        const removeHeaderButton = (
          <button className="fa fa-times btn btn--circle"
                  onClick={() => this.handleRemoveHeader(headerId)}></button>
        );

        const style = {
          borderTop: '1px solid lightgray',
          borderBottom: '1px solid lightgray',
          padding: '5px 0',
          marginTop: 5,
          marginBottom: 5,
          display: 'flex',
          justifyContent: 'space-around'
        };
        actionDrawer = (
          <div style={style}>
            {removeHeaderButton}
          </div>
        );
      }

      let style = {
        marginBottom: 2,
        marginTop: 25,
        paddingLeft: 20,
        paddingTop: 5
      };
      if (isSelected) {
        style.backgroundColor = 'rgba(239, 255, 0, 0.28)';
      }

      return (
        <div className="org-header"
             key={index}
             style={style}
             ref={(newHeader) => { this.lastHeader = newHeader; }}>
          <div style={{marginLeft: -16}}>*</div>
          <TitleLine headerId={headerId}
                     title={title}
                     todoKeyword={todoKeyword}
                     opened={opened}
                     hasContent={hasContent}
                     titleClick={() => this.handleTitleLineClick(headerId, hasContent)}
                     todoClick={() => this.handleTodoClick(headerId)}
                     editMode={inTitleEditMode}
                     actionDrawerToggle={() => this.handleActionDrawerToggle(headerId)} />
          {actionDrawer}
          <HeaderContent headerId={headerId}
                         subheaders={header.get('subheaders')}
                         opened={opened}
                         description={header.get('description')}
                         todoClick={(headerId) => this.handleTodoClick(headerId)}
                         removeHeader={this.props.removeHeader}
                         editMode={inDescriptionEditMode} />
        </div>
      );
    });

    return <div className="org-header-list">{headerListElements}</div>;
  }
}

function mapStateToProps(state, props) {
  return {
    selectedHeaderId: state.org.get('selectedHeaderId'),
    inTitleEditMode: state.org.get('inTitleEditMode'),
    inDescriptionEditMode: state.org.get('inDescriptionEditMode')
  };
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(orgActions, dispatch)
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HeaderList);
