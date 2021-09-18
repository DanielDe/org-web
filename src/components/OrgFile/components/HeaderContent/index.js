import React, { PureComponent, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import './stylesheet.css';

import PlanningItems from './components/PlanningItems';
import PropertyListItems from './components/PropertyListItems';

import _ from 'lodash';

import * as orgActions from '../../../../actions/org';
import * as baseActions from '../../../../actions/base';

import { renderAsText, getCurrentTimestampAsText } from '../../../../lib/timestamps';
import { attributedStringToRawText } from '../../../../lib/export_org';

import AttributedString from '../AttributedString';

class HeaderContent extends PureComponent {
  constructor(props) {
    super(props);

    _.bindAll(this, [
      'handleRef',
      'handleTextareaRef',
      'handleDescriptionChange',
      'handleTextareaBlur',
      'handleTableCellSelect',
      'handleExitTableEditMode',
      'handleTableCellValueUpdate',
      'handleEnterTableEditMode',
      'handleAddNewTableRow',
      'handleRemoveTableRow',
      'handleAddNewTableColumn',
      'handleRemoveTableColumn',
      'handleCheckboxClick',
      'handleListItemSelect',
      'handleEnterListTitleEditMode',
      'handleExitListTitleEditMode',
      'handleListTitleValueUpdate',
      'handleEnterListContentsEditMode',
      'handleExitListContentsEditMode',
      'handleListContentsValueUpdate',
      'handleAddNewListItem',
      'handleRemoveListItem',
      'handleTimestampClick',
      'handleInsertTimestamp',
      'handlePlanningItemTimestampClick',
      'handlePropertyListEdit',
    ]);

    this.state = {
      descriptionValue: this.calculateRawDescription(props.header),
      containerWidth: null,
      shouldIgnoreBlur: false,
    };
  }

  storeContainerWidth() {
    if (this.containerDiv) {
      this.setState({ containerWidth: this.containerDiv.offsetWidth });
    }
  }

  componentDidMount() {
    this.storeContainerWidth();
  }

  componentDidUpdate(prevProps) {
    const { header } = this.props;

    if (prevProps.inEditMode && !this.props.inEditMode) {
      this.props.org.updateHeaderDescription(header.get('id'), this.state.descriptionValue);
    }

    if (prevProps.header !== this.props.header) {
      this.setState(
        {
          descriptionValue: this.calculateRawDescription(this.props.header),
        },
        () => this.storeContainerWidth()
      );
    }
  }

  calculateRawDescription(header) {
    const planningItems = header.get('planningItems');
    const propertyListItems = header.get('propertyListItems');

    const planningItemsText = planningItems
      .map(
        planningItem =>
          `${planningItem.get('type')}: ${renderAsText(planningItem.get('timestamp'))}`
      )
      .join(' ');

    let propertyListItemsText = '';
    if (propertyListItems.size > 0) {
      propertyListItemsText += ':PROPERTIES:\n';
      propertyListItemsText += propertyListItems
        .map(
          propertyListItem =>
            `:${propertyListItem.get('property')}: ${attributedStringToRawText(
              propertyListItem.get('value')
            )}`
        )
        .join('\n');
      propertyListItemsText += '\n:END:';
    }

    return planningItemsText + '\n' + propertyListItemsText + '\n' + header.get('rawDescription');
  }

  handleTextareaRef(textarea) {
    this.textarea = textarea;
  }

  handleRef(div) {
    this.containerDiv = div;
  }

  handleDescriptionChange(event) {
    this.setState({ descriptionValue: event.target.value });
  }

  handleTextareaBlur() {
    // Give the "Insert timestamp" button click a chance to tell us to ignore the blur event.
    setTimeout(() => {
      if (!this.state.shouldIgnoreBlur) {
        this.props.org.exitEditMode();
      } else {
        this.setState({ shouldIgnoreBlur: false });
      }
    }, 0);
  }

  handleTableCellSelect(cellId) {
    this.props.org.setSelectedTableCellId(cellId);
  }

  handleExitTableEditMode() {
    this.props.org.exitEditMode();
  }

  handleTableCellValueUpdate(cellId, newValue) {
    this.props.org.updateTableCellValue(cellId, newValue);
  }

  handleEnterTableEditMode() {
    this.props.org.enterEditMode('table');
  }

  handleAddNewTableRow() {
    this.props.org.addNewTableRow();
  }

  handleRemoveTableRow() {
    this.props.org.removeTableRow();
  }

  handleAddNewTableColumn() {
    this.props.org.addNewTableColumn();
  }

  handleRemoveTableColumn() {
    this.props.org.removeTableColumn();
  }

  handleCheckboxClick(listItemId) {
    this.props.org.advanceCheckboxState(listItemId);
  }

  handleListItemSelect(listItemId) {
    this.props.org.setSelectedListItemId(listItemId);
  }

  handleEnterListTitleEditMode() {
    this.props.org.enterEditMode('list-title');
  }

  handleExitListTitleEditMode() {
    this.props.org.exitEditMode();
  }

  handleListTitleValueUpdate(listItemId, newValue) {
    this.props.org.updateListTitleValue(listItemId, newValue);
  }

  handleEnterListContentsEditMode() {
    this.props.org.enterEditMode('list-contents');
  }

  handleExitListContentsEditMode() {
    this.props.org.exitEditMode();
  }

  handleListContentsValueUpdate(listItemId, newValue) {
    this.props.org.updateListContentsValue(listItemId, newValue);
  }

  handleAddNewListItem() {
    this.props.org.addNewListItemAndEdit();
  }

  handleRemoveListItem() {
    this.props.org.removeListItem();
  }

  handleTimestampClick(timestampId) {
    this.props.base.activatePopup('timestamp-editor', { timestampId });
  }

  handleInsertTimestamp() {
    // Clicking this button will unfocus the textarea, but we don't want to exit edit mode,
    // so instruct the blur handler to ignore the event.
    this.setState({ shouldIgnoreBlur: true });

    const { descriptionValue } = this.state;
    const insertionIndex = this.textarea.selectionStart;
    this.setState({
      descriptionValue:
        descriptionValue.substring(0, insertionIndex) +
        getCurrentTimestampAsText() +
        descriptionValue.substring(this.textarea.selectionEnd || insertionIndex),
    });
    this.textarea.focus();
  }

  handlePlanningItemTimestampClick(headerId) {
    return planningItemIndex =>
      this.props.base.activatePopup('timestamp-editor', { headerId, planningItemIndex });
  }

  handlePropertyListEdit() {
    const { header } = this.props;
    this.props.base.activatePopup('property-list-editor', { headerId: header.get('id') });
  }

  render() {
    const {
      header,
      inEditMode,
      selectedTableCellId,
      inTableEditMode,
      shouldDisableActions,
      selectedListItemId,
      inListTitleEditMode,
      inListContentsEditMode,
    } = this.props;
    const { containerWidth } = this.state;

    if (!header.get('opened')) {
      return <div />;
    }

    return (
      <div
        className="header-content-container nice-scroll"
        ref={this.handleRef}
        style={{ width: containerWidth }}
      >
        {inEditMode ? (
          <div className="header-content__edit-container">
            <textarea
              autoFocus
              className="textarea"
              rows="8"
              ref={this.handleTextareaRef}
              value={this.state.descriptionValue}
              onBlur={this.handleTextareaBlur}
              onChange={this.handleDescriptionChange}
            />
            <div
              className="header-content__insert-timestamp-button"
              onClick={this.handleInsertTimestamp}
            >
              <i className="fas fa-plus insert-timestamp-icon" />
              Insert timestamp
            </div>
          </div>
        ) : (
          <Fragment>
            <PlanningItems
              planningItems={header.get('planningItems')}
              onClick={this.handlePlanningItemTimestampClick(header.get('id'))}
            />
            <PropertyListItems
              propertyListItems={header.get('propertyListItems')}
              onTimestampClick={this.handleTimestampClick}
              shouldDisableActions={shouldDisableActions}
              onEdit={this.handlePropertyListEdit}
            />
            <AttributedString
              parts={header.get('description')}
              subPartDataAndHandlers={{
                onTableCellSelect: this.handleTableCellSelect,
                selectedTableCellId: selectedTableCellId,
                inTableEditMode: inTableEditMode,
                onExitTableEditMode: this.handleExitTableEditMode,
                onTableCellValueUpdate: this.handleTableCellValueUpdate,
                onEnterTableEditMode: this.handleEnterTableEditMode,
                onAddNewTableRow: this.handleAddNewTableRow,
                onRemoveTableRow: this.handleRemoveTableRow,
                onAddNewTableColumn: this.handleAddNewTableColumn,
                onRemoveTableColumn: this.handleRemoveTableColumn,
                onCheckboxClick: this.handleCheckboxClick,
                onListItemSelect: this.handleListItemSelect,
                onEnterListTitleEditMode: this.handleEnterListTitleEditMode,
                onExitListTitleEditMode: this.handleExitListTitleEditMode,
                onListTitleValueUpdate: this.handleListTitleValueUpdate,
                onEnterListContentsEditMode: this.handleEnterListContentsEditMode,
                onExitListContentsEditMode: this.handleExitListContentsEditMode,
                onListContentsValueUpdate: this.handleListContentsValueUpdate,
                onAddNewListItem: this.handleAddNewListItem,
                onRemoveListItem: this.handleRemoveListItem,
                selectedListItemId: selectedListItemId,
                inListTitleEditMode: inListTitleEditMode,
                inListContentsEditMode: inListContentsEditMode,
                onTimestampClick: this.handleTimestampClick,
                shouldDisableActions,
              }}
            />
          </Fragment>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    inEditMode:
      state.org.present.get('editMode') === 'description' &&
      state.org.present.get('selectedHeaderId') === props.header.get('id'),
    isSelected: state.org.present.get('selectedHeaderId') === props.header.get('id'),
    selectedTableCellId: state.org.present.get('selectedTableCellId'),
    inTableEditMode: state.org.present.get('editMode') === 'table',
    selectedListItemId: state.org.present.get('selectedListItemId'),
    inListTitleEditMode: state.org.present.get('editMode') === 'list-title',
    inListContentsEditMode: state.org.present.get('editMode') === 'list-contents',
  };
};

const mapDispatchToProps = dispatch => {
  return {
    org: bindActionCreators(orgActions, dispatch),
    base: bindActionCreators(baseActions, dispatch),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HeaderContent);
