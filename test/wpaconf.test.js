"use strict";

import {assert} from 'chai';
import * as s from './support';
import WPAConf from '../src/wpaconf';

describe('WPAConf', () => {

  it('should load from wpa_supplication config file', () => {
    const wpaconf = new WPAConf(s.EXAMPLE_CONF_FILE);
    assert.equal(s.EXAMPLE_CONF_FILE, wpaconf.file);
    assert.deepEqual(s.EXAMPLE_CONF_OBJECT.conf, wpaconf.conf);
    assert.deepEqual(s.EXAMPLE_CONF_OBJECT.nets, wpaconf.nets);
  });

  it('should add network item', () => {
    const wpaconf = new WPAConf(s.EXAMPLE_CONF_FILE);
    return wpaconf.add('tao', '12345678').then(() => {
      assert.lengthOf(wpaconf.nets, 3);
      assert.equal(wpaconf.nets[2].ssid, '"tao"');
    });
  });

  it('should remove network item', () => {
    const wpaconf = new WPAConf(s.EXAMPLE_CONF_FILE);
    return wpaconf.remove('example').then(() => {
      assert.lengthOf(wpaconf.nets, 1);
      assert.equal(wpaconf.nets[0].key_mgmt, 'NONE');
    });
  });
});
