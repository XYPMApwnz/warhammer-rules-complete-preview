import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const context={window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('roster-guides/points-data.js','utf8'),context);
vm.runInContext(fs.readFileSync('roster-guides/points-validator.js','utf8'),context);

const catalog=context.window.WH_POINTS_CATALOG;
const check=context.window.WHRosterPoints.check;
const plain=value=>JSON.parse(JSON.stringify(value));
assert.equal(Object.keys(catalog['death guard'].units).length,36);
assert.equal(Object.keys(catalog['death guard'].enhancements).length,30);
assert.equal(Object.keys(catalog['adeptus mechanicus'].units).length,39);

const unit=(quantity,name,wargear='')=>({quantity,name,wargear,models:[]});
const validate=(units,declared=0,enhancements=[])=>check({units,declared,enhancements},'death guard');

assert.deepEqual(plain(validate([unit(10,'Plague Marines')],180)),{total:180,unresolved:[],difference:0});
assert.deepEqual(plain(validate([
  unit(3,'Deathshroud Terminators'),
  unit(3,'Deathshroud Terminators'),
  unit(3,'Deathshroud Terminators')
],490)),{total:490,unresolved:[],difference:0});
assert.deepEqual(plain(validate([
  unit(1,'Defiler','Hades lascannon'),
  unit(1,'Defiler','Hades lascannon')
],670)),{total:670,unresolved:[],difference:0});
assert.deepEqual(plain(validate([unit(10,'Plague Marines')],190,['Daemon Weapon of Nurgle'])),{total:190,unresolved:[],difference:0});

const mismatch=validate([unit(10,'Plague Marines')],175);
assert.equal(mismatch.total,180);
assert.equal(mismatch.difference,5);
assert.deepEqual(plain(mismatch.unresolved),[]);

const unknown=validate([unit(1,'Imaginary Plague Tank')],100);
assert.equal(unknown.total,0);
assert.deepEqual(plain(unknown.unresolved),['Unit: Imaginary Plague Tank']);

const mechanicus=check({units:[unit(10,'Skitarii Rangers')],declared:85,enhancements:[]},'adeptus mechanicus');
assert.deepEqual(plain(mechanicus),{total:85,unresolved:[],difference:0});
const mechanicusEnhancement=check({units:[unit(10,'Skitarii Rangers')],declared:85,enhancements:['Example Enhancement']},'adeptus mechanicus');
assert.deepEqual(plain(mechanicusEnhancement.unresolved),['Enhancement: Example Enhancement']);

console.log('Roster points QA passed.');
