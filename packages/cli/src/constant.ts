import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { version: CLI_VERSION } = require('../package.json');
export { CLI_VERSION };
