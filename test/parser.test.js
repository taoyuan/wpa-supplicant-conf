/**
 * wpa-supplicant-conf
 *
 * Copyright © 2016 Yuan Tao. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

const {assert} = require('chai');
const fs = require('fs');
const s = require('./support');
const {parse} = require('../src/parser');

describe('Parser', () => {
  it('should return parsed nets', () => {
    let content = fs.readFileSync(s.EXAMPLE_CONF_FILE, "utf-8");
    const result = parse(content);
    assert.deepEqual(result, s.EXAMPLE_CONF_OBJECT);
  });

});
