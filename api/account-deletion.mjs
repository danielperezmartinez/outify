import { handleDeletion } from '../server/account-deletion.mjs';
export default { fetch: (request) => handleDeletion(request) };
