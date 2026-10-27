import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const scope={window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,'books/shared/points','points-validator.js'),'utf8'),scope,{filename:'books/shared/points/points-validator.js'});

export const pointTierContract=scope.window.WHRosterPoints.tierContract;
