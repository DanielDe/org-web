import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { withRouter } from 'react-router-dom';

import * as syncBackendActions from '../../actions/sync_backend';
import * as baseActions from '../../actions/base';

import './stylesheet.css';

import TabButtons from '../UI/TabButtons';
import Switch from '../UI/Switch';

import _ from 'lodash';

class Settings extends PureComponent {
  constructor(props) {
    super(props);

    _.bindAll(this, [
      'handleSignOutClick',
      'handleKeyboardShortcutsClick',
      'handleCaptureTemplatesClick',
      'handleFontSizeChange',
      'handleBulletStyleChange',
      'handleWeekStartChange',
      'handleShouldTapTodoToAdvanceChange',
      'handleAgendaDefaultDeadlineDelayTypeChange',
      'handleAgendaDefaultDeadlineDelayValueChange',
      'handleAgendaDefaultDeadlineDelayUnitChange',
      'handleShouldStoreSettingsInSyncBackend',
      'handleChangelogClick',
      'handleHelpClick',
    ]);
  }

  handleSignOutClick() {
    if (window.confirm('Are you sure you want to sign out?')) {
      this.props.syncBackend.signOut();
    }
  }

  handleKeyboardShortcutsClick() {
    this.props.base.pushModalPage('keyboard_shortcuts_editor');
  }

  handleCaptureTemplatesClick() {
    this.props.base.pushModalPage('capture_templates_editor');
  }

  handleFontSizeChange(newFontSize) {
    this.props.base.setFontSize(newFontSize);
  }

  handleBulletStyleChange(newBulletStyle) {
    this.props.base.setBulletStyle(newBulletStyle);
  }

  handleWeekStartChange(newWeekStart) {
    this.props.base.setWeekStart(newWeekStart);
  }

  handleShouldTapTodoToAdvanceChange() {
    const { shouldTapTodoToAdvance } = this.props;

    this.props.base.setShouldTapTodoToAdvance(!shouldTapTodoToAdvance);
  }

  //------------------------
  // AGENDA DEFAULT SETTINGS

  handleAgendaDefaultDeadlineDelayTypeChange(newDelayType) {
    console.log('newDelayType' + newDelayType);
    this.props.base.setAgendaDefaultDeadlineDelayType(newDelayType);
  }

  handleAgendaDefaultDeadlineDelayValueChange(e) {
    const target = e.target;
    this.props.base.setAgendaDefaultDeadlineDelayValue(target.value);
  }

  handleAgendaDefaultDeadlineDelayUnitChange(newDelayUnit) {
    this.props.base.setAgendaDefaultDeadlineDelayUnit(newDelayUnit);
  }

  //------------------------


  handleShouldStoreSettingsInSyncBackend() {
    const { shouldStoreSettingsInSyncBackend } = this.props;

    this.props.base.setShouldStoreSettingsInSyncBackend(!shouldStoreSettingsInSyncBackend);
  }

  handleChangelogClick() {
    this.props.base.pushModalPage('changelog');
  }

  handleHelpClick() {
    this.props.base.pushModalPage('sample');
  }

  render() {
    const {
      fontSize,
      bulletStyle,
      shouldTapTodoToAdvance,
      shouldStoreSettingsInSyncBackend,
      agendaDefaultDeadlineDelayType,
      agendaDefaultDeadlineDelayValue,
      agendaDefaultDeadlineDelayUnit,
      hasUnseenChangelog,
    } = this.props;

    return (
      <div className="settings-container">
        <div className="setting-container">
          <div className="setting-label">Font size</div>
          <TabButtons
            buttons={['Regular', 'Large']}
            selectedButton={fontSize}
            onSelect={this.handleFontSizeChange}
          />
        </div>

        <div className="setting-container">
          <div className="setting-label">Bullet style</div>
          <TabButtons
            buttons={['Classic', 'Fancy']}
            selectedButton={bulletStyle}
            onSelect={this.handleBulletStyleChange}
          />
        </div>

        <div className="setting-container">
          <div className="setting-label">Tap TODO to advance state</div>
          <Switch
            isEnabled={shouldTapTodoToAdvance}
            onToggle={this.handleShouldTapTodoToAdvanceChange}
          />
        </div>

        <div className="setting-container">
          <div className="setting-label">
            Store settings in sync backend
            <div className="setting-label__description">
              Store settings and keyboard shortcuts in a .org-web-config.json file in your sync
              backend to sync betweeen multiple devices.
            </div>
          </div>
          <Switch
            isEnabled={shouldStoreSettingsInSyncBackend}
            onToggle={this.handleShouldStoreSettingsInSyncBackend}
          />
        </div>


        <div className="setting-container">
          <div className="setting-label">
            Agenda default deadline delay
            <div className="setting-label__description">
              Store settings and keyboard shortcuts in a .org-web-config.json file in your sync
              backend to sync betweeen multiple devices.
            </div>
          </div>
          <div className="timestamp-editor__delay-repeater-type">
            <TabButtons
              buttons={['-', '--']}
              selectedButton={agendaDefaultDeadlineDelayType || '-'}
              onSelect={this.handleAgendaDefaultDeadlineDelayTypeChange}
            />
          </div>



          <input
            type="number"
            min="1"
            className="textfield delay-repeater-value-input"
            value={agendaDefaultDeadlineDelayValue || 5}
            onChange={this.handleAgendaDefaultDeadlineDelayValueChange}
          />

          <div>
            <TabButtons
              buttons={'hdwmy'.split('')}
              selectedButton={agendaDefaultDeadlineDelayUnit || 'h'}
              onSelect={this.handleAgendaDefaultDeadlineDelayUnitChange}
            />
          </div>
        </div>


        <div className="settings-buttons-container">
          <button className="btn settings-btn" onClick={this.handleCaptureTemplatesClick}>
            Capture templates
          </button>
          <button className="btn settings-btn" onClick={this.handleKeyboardShortcutsClick}>
            Keyboard shortcuts
          </button>

          <hr className="settings-button-separator" />

          <button className="btn settings-btn" onClick={this.handleChangelogClick}>
            Changelog
            {hasUnseenChangelog && (
              <div className="changelog-badge-container">
                <i className="fas fa-gift" />
              </div>
            )}
          </button>
          <button className="btn settings-btn" onClick={this.handleHelpClick}>
            Help
          </button>
          <button className="btn settings-btn">
            <a
              href="https://github.com/DanielDe/org-web"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'white' }}
            >
              Github repo <i className="fas fa-external-link-alt fa-sm" />
            </a>
          </button>

          <hr className="settings-button-separator" />

          <button className="btn settings-btn" onClick={this.handleSignOutClick}>
            Sign out
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    fontSize: state.base.get('fontSize') || 'Regular',
    bulletStyle: state.base.get('bulletStyle') || 'Classic',
    shouldTapTodoToAdvance: state.base.get('shouldTapTodoToAdvance'),
    agendaDefaultDeadlineDelayType: state.base.get('agendaDefaultDeadlineDelayType') || '-',
    agendaDefaultDeadlineDelayValue: state.base.get('agendaDefaultDeadlineDelayValue') || 5,
    agendaDefaultDeadlineDelayUnit: state.base.get('agendaDefaultDeadlineDelayUnit') || 'd',
    shouldStoreSettingsInSyncBackend: state.base.get('shouldStoreSettingsInSyncBackend'),
    hasUnseenChangelog: state.base.get('hasUnseenChangelog'),
  };
};

const mapDispatchToProps = dispatch => {
  return {
    syncBackend: bindActionCreators(syncBackendActions, dispatch),
    base: bindActionCreators(baseActions, dispatch),
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Settings)
);
