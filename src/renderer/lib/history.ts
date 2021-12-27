import { createHashHistory } from 'history';

/**
 * We use our own history because we need to imperatively push states to it
 * for menu actions, global shortcuts, etc.
 *
 * The effort to transition to a full HashRouter is not worth at the moment
 * imho.
 */
const history = createHashHistory();

export default history;
