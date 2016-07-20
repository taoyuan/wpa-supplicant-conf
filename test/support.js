"use strict";

import fs from 'fs-extra';
import nockexec from 'nock-exec';

export const EXAMPLE_CONF_FILE = `${__dirname}/fixtures/wpa_supplicant.example.conf`;
export const EXAMPLE_PASSPHRASE_FILE = `${__dirname}/fixtures/wpa_passphrase.example.txt`;

export const EXAMPLE_CONF_OBJECT= {
  nets: [{
    ssid: '"example"',
    psk: '"very secret passphrase"',
    bssid_whitelist: '02:55:ae:bc:00:00/ff:ff:ff:ff:00:00 00:00:77:66:55:44/00:00:ff:ff:ff:ff'
  },
    {key_mgmt: 'NONE'}],
  conf: 'ctrl_interface=/var/run/wpa_supplicant\neapol_version=1\nap_scan=1\nfast_reauth=1'
};

const EXAMPLE_PASSPHRASE = fs.readFileSync(EXAMPLE_PASSPHRASE_FILE, 'utf-8');
nockexec('wpa_passphrase "tao" "12345678"').out(EXAMPLE_PASSPHRASE);

export function copyFile(from, to) {
  fs.writeFileSync(to, fs.readFileSync(from));
}

export function fileContains(file, s) {
  const content = fs.readFileSync(file, 'utf-8');
  if (s instanceof RegExp) {
    return s.test(content);
  } else {
    return content.indexOf(s) >= 0;
  }
}
