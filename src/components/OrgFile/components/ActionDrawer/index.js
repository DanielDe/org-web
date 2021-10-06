import React, { Fragment, useState, useEffect, useMemo, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Motion, spring } from 'react-motion';

import './stylesheet.css';

import { List } from 'immutable';

import * as orgActions from '../../../../actions/org';
import * as captureActions from '../../../../actions/capture';
import * as baseActions from '../../../../actions/base';

import sampleCaptureTemplates from '../../../../lib/sample_capture_templates';

import ActionButton from './components/ActionButton/';

const ActionDrawer = ({
  org,
  selectedHeaderId,
  base,
  staticFile,
  captureTemplates,
  path,
  selectedTableCellId,
  selectedListItemId,
  inEditMode,
  isLoading,
  shouldDisableSyncButtons,
}) => {
  const [isDisplayingArrowButtons, setIsDisplayingArrowButtons] = useState(false);
  const [isDisplayingCaptureButtons, setIsDisplayingCaptureButtons] = useState(false);

  // Send a no-op action to take care of the bug where redux-undo won't allow the first
  // action to be undone.
  useEffect(() => {
    org.noOp();
  }, []);

  useEffect(() => {
    document.querySelector('html').style.paddingBottom = '90px';

    return () => (document.querySelector('html').style.paddingBottom = '0px');
  });

  const mainArrowButton = useRef(null);

  const mainArrowButtonBoundingRect = useMemo(
    () => (!!mainArrowButton.current ? mainArrowButton.current.getBoundingClientRect() : null),
    [mainArrowButton.current]
  );

  const handleUpClick = () =>
    !!selectedHeaderId
      ? org.moveHeaderUp(selectedHeaderId)
      : !!selectedTableCellId
      ? org.moveTableRowUp()
      : org.moveListItemUp();

  const handleDownClick = () =>
    !!selectedHeaderId
      ? org.moveHeaderDown(selectedHeaderId)
      : !!selectedTableCellId
      ? org.moveTableRowDown()
      : org.moveListItemDown();

  const handleLeftClick = () =>
    !!selectedHeaderId
      ? org.moveHeaderLeft(selectedHeaderId)
      : !!selectedTableCellId
      ? org.moveTableColumnLeft()
      : org.moveListItemLeft();

  const handleRightClick = () =>
    !!selectedHeaderId
      ? org.moveHeaderRight(selectedHeaderId)
      : !!selectedTableCellId
      ? org.moveTableColumnRight()
      : org.moveListItemRight();

  const handleMoveSubtreeLeftClick = () =>
    !!selectedHeaderId ? org.moveSubtreeLeft(selectedHeaderId) : org.moveListSubtreeLeft();

  const handleMoveSubtreeRightClick = () =>
    !!selectedHeaderId ? org.moveSubtreeRight(selectedHeaderId) : org.moveListSubtreeRight();

  const handleDoneClick = () => org.exitEditMode();

  const handleCaptureButtonClick = templateId => () => {
    setIsDisplayingCaptureButtons(false);
    base.activatePopup('capture', { templateId });
  };

  const getSampleCaptureTemplates = () => sampleCaptureTemplates;

  const getAvailableCaptureTemplates = () =>
    staticFile === 'sample'
      ? getSampleCaptureTemplates()
      : captureTemplates.filter(
          template =>
            template.get('isAvailableInAllOrgFiles') ||
            template
              .get('orgFilesWhereAvailable')
              .map(availablePath =>
                availablePath.trim().startsWith('/')
                  ? availablePath.trim()
                  : '/' + availablePath.trim()
              )
              .includes((path || '').trim())
        );

  const handleSync = () => org.sync();

  const handleMainArrowButtonClick = () => setIsDisplayingArrowButtons(!isDisplayingArrowButtons);

  const handleMainCaptureButtonClick = () => {
    if (!isDisplayingCaptureButtons && getAvailableCaptureTemplates().size === 0) {
      alert(
        `You don't have any capture templates set up for this file! Add some in Settings > Capture Templates`
      );
      return;
    }

    setIsDisplayingCaptureButtons(!isDisplayingCaptureButtons);
  };

  const renderCaptureButtons = () => {
    const availableCaptureTemplates = getAvailableCaptureTemplates();

    const baseCaptureButtonStyle = {
      position: 'absolute',
      zIndex: 0,
      left: 0,
      opacity: isDisplayingArrowButtons ? 0 : 1,
    };
    if (!isDisplayingCaptureButtons) {
      baseCaptureButtonStyle.boxShadow = 'none';
    }

    const mainButtonStyle = {
      opacity: isDisplayingArrowButtons ? 0 : 1,
      position: 'relative',
      zIndex: 1,
    };

    const animatedStyle = {
      bottom: spring(isDisplayingCaptureButtons ? 70 : 0, { stiffness: 300 }),
    };

    return (
      <Motion style={animatedStyle}>
        {style => (
          <div className="action-drawer__capture-buttons-container">
            <ActionButton
              iconName={isDisplayingCaptureButtons ? 'times' : 'list-ul'}
              isDisabled={false}
              onClick={handleMainCaptureButtonClick}
              style={mainButtonStyle}
              tooltip={
                isDisplayingCaptureButtons ? 'Hide capture templates' : 'Show capture templates'
              }
            />

            {availableCaptureTemplates.map((template, index) => (
              <ActionButton
                key={template.get('id')}
                letter={template.get('letter')}
                iconName={template.get('iconName')}
                isDisabled={false}
                onClick={handleCaptureButtonClick(template.get('id'))}
                style={{ ...baseCaptureButtonStyle, bottom: style.bottom * (index + 1) }}
                tooltip={`Activate "${template.get('description')}" capture template`}
              />
            ))}
          </div>
        )}
      </Motion>
    );
  };

  const renderMovementButtons = () => {
    const baseArrowButtonStyle = {
      opacity: isDisplayingCaptureButtons ? 0 : 1,
    };
    if (!isDisplayingArrowButtons) {
      baseArrowButtonStyle.boxShadow = 'none';
    }

    let centerXOffset = 0;
    if (!!mainArrowButtonBoundingRect) {
      centerXOffset =
        window.screen.width / 2 -
        (mainArrowButtonBoundingRect.x + mainArrowButtonBoundingRect.width / 2);
    }

    const animatedStyles = {
      centerXOffset: spring(isDisplayingArrowButtons ? centerXOffset : 0, { stiffness: 300 }),
      topRowYOffset: spring(isDisplayingArrowButtons ? 150 : 0, { stiffness: 300 }),
      bottomRowYOffset: spring(isDisplayingArrowButtons ? 80 : 0, { stiffness: 300 }),
      firstColumnXOffset: spring(isDisplayingArrowButtons ? 70 : 0, {
        stiffness: 300,
      }),
      secondColumnXOffset: spring(isDisplayingArrowButtons ? 140 : 0, {
        stiffness: 300,
      }),
    };

    let subIconNameStr = null;
    let tooltipUpStr = 'Move header up';
    let tooltipDownStr = 'Move header down';
    let tooltipLeftStr = 'Move header left';
    let tooltipRightStr = 'Move header right';
    if (!!selectedTableCellId) {
      subIconNameStr = 'table';
      tooltipUpStr = 'Move row up';
      tooltipDownStr = 'Move row down';
      tooltipLeftStr = 'Move column left';
      tooltipRightStr = 'Move column right';
    } else if (!!selectedListItemId) {
      subIconNameStr = 'list';
      tooltipUpStr = 'Move list up';
      tooltipDownStr = 'Move list down';
      tooltipLeftStr = 'Move list left';
      tooltipRightStr = 'Move list right';
    }

    return (
      <Motion style={animatedStyles}>
        {style => (
          <div
            className="action-drawer__arrow-buttons-container"
            style={{ left: style.centerXOffset }}
          >
            <ActionButton
              additionalClassName="action-drawer__arrow-button"
              iconName="arrow-up"
              subIconName={subIconNameStr}
              isDisabled={false}
              onClick={handleUpClick}
              style={{ ...baseArrowButtonStyle, bottom: style.topRowYOffset }}
              tooltip={tooltipUpStr}
            />
            <ActionButton
              additionalClassName="action-drawer__arrow-button"
              iconName="arrow-down"
              subIconName={subIconNameStr}
              isDisabled={false}
              onClick={handleDownClick}
              style={{ ...baseArrowButtonStyle, bottom: style.bottomRowYOffset }}
              tooltip={tooltipDownStr}
            />
            <ActionButton
              additionalClassName="action-drawer__arrow-button"
              iconName="arrow-left"
              subIconName={subIconNameStr}
              isDisabled={false}
              onClick={handleLeftClick}
              style={{
                ...baseArrowButtonStyle,
                bottom: style.bottomRowYOffset,
                right: style.firstColumnXOffset,
              }}
              tooltip={tooltipLeftStr}
            />
            <ActionButton
              additionalClassName="action-drawer__arrow-button"
              iconName="arrow-right"
              subIconName={subIconNameStr}
              isDisabled={false}
              onClick={handleRightClick}
              style={{
                ...baseArrowButtonStyle,
                bottom: style.bottomRowYOffset,
                left: style.firstColumnXOffset,
              }}
              tooltip={tooltipRightStr}
            />
            {!selectedTableCellId && (
              <Fragment>
                <ActionButton
                  additionalClassName="action-drawer__arrow-button"
                  iconName="chevron-left"
                  subIconName={subIconNameStr}
                  isDisabled={false}
                  onClick={handleMoveSubtreeLeftClick}
                  style={{
                    ...baseArrowButtonStyle,
                    bottom: style.bottomRowYOffset,
                    right: style.secondColumnXOffset,
                  }}
                  tooltip="Move entire subtree left"
                />
                <ActionButton
                  additionalClassName="action-drawer__arrow-button"
                  iconName="chevron-right"
                  subIconName={subIconNameStr}
                  isDisabled={false}
                  onClick={handleMoveSubtreeRightClick}
                  style={{
                    ...baseArrowButtonStyle,
                    bottom: style.bottomRowYOffset,
                    left: style.secondColumnXOffset,
                  }}
                  tooltip="Move entire subtree right"
                />
              </Fragment>
            )}

            <ActionButton
              iconName={isDisplayingArrowButtons ? 'times' : 'arrows-alt'}
              subIconName={subIconNameStr}
              additionalClassName="action-drawer__main-arrow-button"
              isDisabled={false}
              onClick={handleMainArrowButtonClick}
              style={{ opacity: isDisplayingCaptureButtons ? 0 : 1 }}
              tooltip={isDisplayingArrowButtons ? 'Hide movement buttons' : 'Show movement buttons'}
              onRef={mainArrowButton}
            />
          </div>
        )}
      </Motion>
    );
  };

  const handleAgendaClick = () => base.activatePopup('agenda');

  return (
    <div className="action-drawer-container nice-scroll">
      {inEditMode ? (
        <button className="btn action-drawer__done-btn" onClick={handleDoneClick}>
          Done
        </button>
      ) : (
        <Fragment>
          <ActionButton
            iconName="cloud"
            subIconName="sync-alt"
            shouldSpinSubIcon={isLoading}
            isDisabled={shouldDisableSyncButtons}
            onClick={handleSync}
            style={{ opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1 }}
            tooltip="Sync changes"
          />

          {renderMovementButtons()}

          <ActionButton
            iconName="calendar-alt"
            shouldSpinSubIcon={isLoading}
            isDisabled={false}
            onClick={handleAgendaClick}
            style={{ opacity: isDisplayingArrowButtons || isDisplayingCaptureButtons ? 0 : 1 }}
            tooltip="Show agenda"
          />

          {renderCaptureButtons()}
        </Fragment>
      )}
    </div>
  );
};

const mapStateToProps = (state, props) => {
  return {
    inEditMode: !!state.org.present.get('editMode'),
    selectedHeaderId: state.org.present.get('selectedHeaderId'),
    isDirty: state.org.present.get('isDirty'),
    isFocusedHeaderActive: !!state.org.present.get('focusedHeaderId'),
    selectedTableCellId: state.org.present.get('selectedTableCellId'),
    selectedListItemId: state.org.present.get('selectedListItemId'),
    captureTemplates: state.capture.get('captureTemplates', new List()),
    path: state.org.present.get('path'),
    isLoading: state.base.get('isLoading'),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    org: bindActionCreators(orgActions, dispatch),
    capture: bindActionCreators(captureActions, dispatch),
    base: bindActionCreators(baseActions, dispatch),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ActionDrawer);
