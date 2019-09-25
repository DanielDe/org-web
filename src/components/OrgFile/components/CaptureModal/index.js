import React, { Fragment, useState, useEffect, useRef, useMemo } from 'react';

import './stylesheet.css';

import ActionButton from '../ActionDrawer/components/ActionButton/';
import Switch from '../../../UI/Switch/';
import Drawer from '../../../UI/Drawer/';

import { headerWithPath } from '../../../../lib/org_utils';
import substituteTemplateVariables from '../../../../lib/capture_template_substitution';

import classNames from 'classnames';

export default ({ template, onCapture, headers, onClose }) => {
  const [substitutedTemplate, initialCursorIndex] = useMemo(
    () => substituteTemplateVariables(template.get('template')),
    [template.get('template')]
  );

  const isTopLevelTarget = template.get('headerPaths').filter(path => path.length !== 0).size === 0;
  const targetHeader = useMemo(() => headerWithPath(headers, template.get('headerPaths')), [
    headers,
    template.get('headerPaths'),
  ]);

  const [textareaValue, setTextareaValue] = useState(substitutedTemplate);
  const [shouldPrepend, setShouldPrepend] = useState(template.get('shouldPrepend'));

  const textarea = useRef(null);

  useEffect(() => {
    if (textarea.current) {
      textarea.current.focus();
      if (initialCursorIndex !== null) {
        textarea.current.selectionStart = initialCursorIndex;
        textarea.current.selectionEnd = initialCursorIndex;
      }
    }
  }, [textarea]);

  const handleCaptureClick = () => onCapture(template.get('id'), textareaValue, shouldPrepend);

  const handleTextareaChange = event => setTextareaValue(event.target.value);

  const handlePrependSwitchToggle = () => setShouldPrepend(!shouldPrepend);

  return (
    <Drawer onClose={onClose}>
      <div className="capture-modal-header">
        <ActionButton
          letter={template.get('letter')}
          iconName={template.get('iconName')}
          isDisabled={false}
          onClick={() => {}}
          style={{ marginRight: 20 }}
        />

        <span>{template.get('description')}</span>
      </div>

      <div
        className={classNames('capture-modal-header-path', {
          'capture-modal-header-path--top-level': isTopLevelTarget,
        })}
      >
        {isTopLevelTarget ? 'Top level header' : template.get('headerPaths').join(' > ')}
      </div>

      {!!targetHeader || isTopLevelTarget ? (
        <Fragment>
          <textarea
            className="textarea capture-modal-textarea"
            rows="4"
            value={textareaValue}
            onChange={handleTextareaChange}
            ref={textarea}
          />

          <div className="capture-modal-button-container">
            <div className="capture-modal-prepend-container">
              <span className="capture-modal-prepend-label">Prepend:</span>
              <Switch isEnabled={shouldPrepend} onToggle={handlePrependSwitchToggle} />
            </div>

            <button className="btn capture-modal-button" onClick={handleCaptureClick}>
              Capture
            </button>
          </div>
        </Fragment>
      ) : (
        <div className="capture-modal-error-message">
          The specified header path doesn't exist in this org file!
        </div>
      )}

      <br />
    </Drawer>
  );
};
