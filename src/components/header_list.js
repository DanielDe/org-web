import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as orgActions from '../actions/org';
import TitleLine from './title_line';
import HeaderContent from './header_content';

class HeaderList extends Component {
  constructor(props) {
    super(props);
    this.handleTitleLineClick = this.handleTitleLineClick.bind(this);

    this.state = {
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
                     editMode={inTitleEditMode} />
          <HeaderContent headerId={headerId}
                         subheaders={header.get('subheaders')}
                         opened={opened}
                         description={header.get('description')}
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
