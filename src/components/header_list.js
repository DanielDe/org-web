import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as orgActions from '../actions/org';
import TitleLine from './title_line';
import HeaderContent from './header_content';

class HeaderList extends Component {
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
        rawTitle: header.titleLine.rawTitle,
        todoKeyword: header.titleLine.todoKeyword,
        description: header.description,
        rawDescription: header.rawDescription,
        selected: isSelected,
        opened: header.opened,
        titleEditMode: inTitleEditMode,
        descriptionEditMode: inDescriptionEditMode,
        hasContent: !!header.description
      };
    });

    headerData.forEach((header, index) => {
      // Iterate over all previous headers to check for parents of this header. If this header
      // has no parents, it should be displayed.
      const previousHeaders = headerData.slice(0, index);
      const noParents = previousHeaders.every(previousHeader => {
        return previousHeader.nestingLevel >= header.nestingLevel;
      });
      if (noParents) {
        header.displayed = true;
      }

      // Iterate over all following headers to check for direct descendants of this one.
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
             style={style}>
          <div style={{marginLeft: -16}}>*</div>
          <TitleLine headerId={header.headerId}
                     title={header.title}
                     rawTitle={header.rawTitle}
                     todoKeyword={header.todoKeyword}
                     opened={header.opened}
                     hasContent={header.hasContent}
                     editMode={header.titleEditMode} />
          <HeaderContent headerId={header.headerId}
                         opened={header.opened}
                         description={header.description}
                         rawDescription={header.rawDescription}
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
