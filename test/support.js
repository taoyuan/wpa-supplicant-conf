"use strict";

const fs = require('fs-extra');
const nockexec = require('nock-exec');

exports.EXAMPLE_CONF_FILE = `${__dirname}/fixtures/wpa_supplicant.example.conf`;

exports.EXAMPLE_CONF_OBJECT= {
  nets: [{
    ssid: '"example"',
    psk: '"very secret passphrase"',
    bssid_whitelist: '02:55:ae:bc:00:00/ff:ff:ff:ff:00:00 00:00:77:66:55:44/00:00:ff:ff:ff:ff'
  },
    {key_mgmt: 'NONE'}],
  conf: 'ctrl_interface=/var/run/wpa_supplicant\neapol_version=1\nap_scan=1\nfast_reauth=1'
};

const EXAMPLE_PASSPHRASE = fs.readFileSync(`${__dirname}/fixtures/wpa_passphrase.example.txt`, 'utf-8');
nockexec('wpa_passphrase "tao" "12345678"').out(EXAMPLE_PASSPHRASE);

exports.copyFile = function(from, to) {
  fs.writeFileSync(to, fs.readFileSync(from));
};

exports.fileContains = function(file, s) {
  const content = fs.readFileSync(file, 'utf-8');
  if (s instanceof RegExp) {
    return s.test(content);
  } else {
    return content.indexOf(s) >= 0;
  }
};
