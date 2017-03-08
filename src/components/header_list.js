import React, { Component } from 'react';
import TitleLine from './title_line';
import HeaderContent from './header_content';
import Immutable from 'immutable';

class HeaderList extends Component {
  constructor(props) {
    super(props);
    this.handleTitleLineClick = this.handleTitleLineClick.bind(this);
    this.handleTodoClick = this.handleTodoClick.bind(this);
    this.handleAddHeader = this.handleAddHeader.bind(this);
    this.handleRemoveHeader = this.handleRemoveHeader.bind(this);
    this.handleTitleEdit = this.handleTitleEdit.bind(this);
    this.handleTitleEditButton = this.handleTitleEditButton.bind(this);
    this.handleDescriptionEdit = this.handleDescriptionEdit.bind(this);
    this.handleDescriptionEditButton = this.handleDescriptionEditButton.bind(this);
    this.handleActionDrawerToggle = this.handleActionDrawerToggle.bind(this);

    this.state = {
      headersShowingActionDrawer: new Immutable.List(),
      headerInTitleEditMode: null,
      headerInDescriptionEditMode: null,
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
    if (hasContent) {
      this.props.titleClick(headerId, true);
    }
  }

  handleTodoClick(headerId) {
    this.props.todoClick(headerId);
  }

  handleAddHeader(parentHeaderId) {
    this.props.addHeader(parentHeaderId);
  }

  handleRemoveHeader(headerId) {
    if (window.confirm('Are you sure you want to delete this header?')) {
      this.props.removeHeader(headerId);
    }
  }

  handleTitleEdit(headerId, newTitle) {
    this.props.titleEdit(headerId, newTitle);
  }

  handleTitleEditButton(headerId) {
    if (this.state.headerInTitleEditMode === headerId) {
      this.setState({
        headerInTitleEditMode: null
      });
    } else {
      this.setState({
        headerInTitleEditMode: headerId
      });
    }
  }

  handleDescriptionEdit(headerId, newDescription) {
    this.props.descriptionEdit(headerId, newDescription);
  }

  handleDescriptionEditButton(headerId) {
    if (this.state.headerInDescriptionEditMode === headerId) {
      this.setState({
        headerInDescriptionEditMode: null
      });
    } else {
      this.setState({
        headerInDescriptionEditMode: headerId
      });
      this.props.openHeader(headerId);
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
      const inTitleEditMode = this.state.headerInTitleEditMode === headerId;
      const inDescriptionEditMode = this.state.headerInDescriptionEditMode === headerId;

      let actionDrawer = null;
      if (this.state.headersShowingActionDrawer.includes(headerId)) {
        const editTitleButtonIcon = inTitleEditMode ? 'check' : 'pencil';
        const editTitleButton = (
          <button className={`fa fa-${editTitleButtonIcon} btn btn--circle edit-icon`}
                  onClick={() => this.handleTitleEditButton(headerId)}></button>
        );

        const addHeaderButton = (
          <button className="btn btn--circle"
                  onClick={() => this.handleAddHeader(headerId)}>+</button>
        );

        const editDescriptionButtonIcon = inDescriptionEditMode ? 'check' : 'pencil-square-o';
        const editDescriptionButton = (
          <button className={`fa fa-${editDescriptionButtonIcon} btn btn--circle`}
                  style={{boxSizing: 'border-box', paddingLeft: 3}}
                  onClick={() => this.handleDescriptionEditButton(headerId)}></button>
        );

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
            {editTitleButton} {addHeaderButton} {editDescriptionButton} {removeHeaderButton}
          </div>
        );
      }

      const style = {
        marginBottom: 2,
        marginTop: 25,
        paddingLeft: 20
      };
      return (
        <div className="org-header"
             key={index}
             style={style}
             ref={(newHeader) => { this.lastHeader = newHeader; }}>
          <div style={{marginLeft: -20}}>*</div>
          <TitleLine title={title}
                     todoKeyword={todoKeyword}
                     opened={opened}
                     hasContent={hasContent}
                     titleClick={() => this.handleTitleLineClick(headerId, hasContent)}
                     todoClick={() => this.handleTodoClick(headerId)}
                     titleEdit={(newTitle) => this.handleTitleEdit(headerId, newTitle)}
                     editMode={inTitleEditMode}
                     actionDrawerToggle={() => this.handleActionDrawerToggle(headerId)} />
          {actionDrawer}
          <HeaderContent description={header.get('description')}
                         subheaders={header.get('subheaders')}
                         opened={opened}
                         headerId={headerId}
                         titleClick={(headerId) => this.handleTitleLineClick(headerId, hasContent)}
                         todoClick={(headerId) => this.handleTodoClick(headerId)}
                         addHeader={(parentHeaderId) => this.handleAddHeader(parentHeaderId)}
                         openHeader={this.props.openHeader}
                         removeHeader={this.props.removeHeader}
                         titleEdit={(headerId, newTitle) => this.handleTitleEdit(headerId, newTitle)}
                         editMode={inDescriptionEditMode}
                         descriptionEdit={(headerId, newDescription) => this.handleDescriptionEdit(headerId || header.get('id'), newDescription)} />
        </div>
      );
    });

    return <div className="org-header-list">{headerListElements}</div>;
  }
}

export default HeaderList;
