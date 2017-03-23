import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as orgActions from '../actions/org';
import TitleLine from './title_line';
import HeaderContent from './header_content';

class HeaderList extends Component {
  constructor(props) {
    super(props);

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

  render() {
    if (this.props.headers.length === 0) {
      return <div></div>;
    }

    let headerData = this.props.headers.toJS().map((header, index) => {
      const isSelected = header.id === this.props.selectedHeaderId;
      const inTitleEditMode = isSelected && this.props.inTitleEditMode;
      const inDescriptionEditMode = isSelected && this.props.inDescriptionEditMode;

      return {
        headerId: header.id,
        nestingLevel: header.nestingLevel,
        title: header.titleLine.title,
        todoKeyword: header.titleLine.todoKeyword,
        description: header.description,
        selected: isSelected,
        opened: header.opened,
        titleEditMode: inTitleEditMode,
        descriptionEditMode: inDescriptionEditMode,
        displayed: header.nestingLevel === 1,
        hasContent: !!header.description
      };
    });

    headerData.forEach((header, index) => {
      const remainingHeaders = headerData.slice(index + 1);
      for (let i = 0; i < remainingHeaders.length; ++i) {
        let subheader = remainingHeaders[i];
        if (subheader.nestingLevel <= header.nestingLevel) {
          break;
        }

        // This header has at least one subheader.
        header.hasContent = true;

        // If this header is open and displayed, all of its subheaders are displayed.
        // Otherwise they're all hidden.
        subheader.displayed = header.opened && header.displayed;
      }
    });

    const headerListElements = headerData.filter(header => {
      return header.displayed;
    }).map((header, index) => {
      let style = {
        paddingLeft: 20 * header.nestingLevel,
        marginBottom: 2,
        marginTop: 25,
        paddingTop: 5
      };
      if (header.selected) {
        style.backgroundColor = 'rgba(239, 255, 0, 0.28)';
      }

      return (
        <div className="org-header"
             key={header.headerId}
             style={style}
             ref={(newHeader) => { this.lastHeader = newHeader; }}>
          <div style={{marginLeft: -16}}>*</div>
          <TitleLine headerId={header.headerId}
                     title={header.title}
                     todoKeyword={header.todoKeyword}
                     opened={header.opened}
                     hasContent={header.hasContent}
                     editMode={header.titleEditMode} />
          <HeaderContent headerId={header.headerId}
                         opened={header.opened}
                         description={header.description}
                         editMode={header.descriptionEditMode} />
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
