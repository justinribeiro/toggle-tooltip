/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

const projectRoot = path.resolve('./');
const publishRoot = path.resolve(`${projectRoot}/publish`);

// Clean up any existing publish directory
fs.removeSync(publishRoot);

// Compile our typescript
execSync(`yarn tsc --project ./tsconfig-publish.json`);

// Compile our toggle-tooltip CE definition (experimental spec)
execSync(
  `yarn wca analyze "publish/**/*.{js,ts}" --outFile ./publish/custom-elements.json`
);

// Compile our toggle-tooltip readme (experimental spec)
execSync(
  `yarn wca analyze "publish/**/*.{js,ts}" --outFile ./publish/README.md`
);

// Copy the package.json to the publish dir
fs.copySync(`${projectRoot}/package.json`, `${publishRoot}/package.json`);

// npm pack a build instead of publishing
execSync(`cd ${publishRoot}`);

console.log('Ready to publish!');
