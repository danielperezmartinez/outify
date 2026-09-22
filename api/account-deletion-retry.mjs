import { handleDeletionCron } from '../server/account-deletion.mjs';
export default { fetch: (request) => handleDeletionCron(request) };
