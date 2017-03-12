/* globals ga */
const googleAnalyticsLogging = store => next => action => {
  const { type, ...payload } = action;
  ga('send', 'event', 'action', type, JSON.stringify(payload));

  return next(action);
};

export default googleAnalyticsLogging;
