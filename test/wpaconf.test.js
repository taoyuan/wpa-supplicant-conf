"use strict";

const {assert} = require('chai');
const tmp  = require('tmp');
const s = require('./support');
const {WPAConf} = require('..');

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

  it('should add and save network item', () => {
    const tmpobj = tmp.fileSync();
    const file = tmpobj.name;

    s.copyFile(s.EXAMPLE_CONF_FILE, file);
    const wpaconf = new WPAConf(file);
    return wpaconf.addAndSave('tao', '12345678').then(() => {
      assert.ok(s.fileContains(file, /ssid="tao"/));
    }).finally(() => tmpobj.removeCallback());
  });

  it('should remove network item', () => {
    const wpaconf = new WPAConf(s.EXAMPLE_CONF_FILE);
    return wpaconf.remove('example').then(() => {
      assert.lengthOf(wpaconf.nets, 1);
      assert.equal(wpaconf.nets[0].key_mgmt, 'NONE');
    });
  });

  it('should remove and save network item', () => {
    const tmpobj = tmp.fileSync();
    const file = tmpobj.name;

    s.copyFile(s.EXAMPLE_CONF_FILE, file);

    assert.ok(s.fileContains(file, /ssid="example"/));

    const wpaconf = new WPAConf(file);
    return wpaconf.removeAndSave('example').then(() => {
      assert.notOk(s.fileContains(file, /ssid="example"/));
    }).finally(() => tmpobj.removeCallback());
  });

  it('should add network item with only options', () => {
    const wpaconf = new WPAConf(s.EXAMPLE_CONF_FILE);
    return wpaconf.add({
      ssid: 'tao',
      password: '12345678'
    }).then(() => {
      assert.lengthOf(wpaconf.nets, 3);
      assert.equal(wpaconf.nets[2].ssid, '"tao"');
    });
  });

  it('should add un-secure network item', () => {
    const wpaconf = new WPAConf(s.EXAMPLE_CONF_FILE);
    return wpaconf.add('tao', {
      key_mgmt: 'NONE'
    }).then(() => {
      assert.lengthOf(wpaconf.nets, 3);
      assert.deepEqual(wpaconf.nets[2], {ssid: 'tao', key_mgmt: 'NONE'});
    });
  });

});
