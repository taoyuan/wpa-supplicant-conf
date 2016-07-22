/**
 * wpa-supplicant-conf
 *
 * Copyright © 2016 Yuan Tao. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import fs from 'fs';
import Promise from 'bluebird';
import {exec} from 'child-process-promise';
import {parse} from './parser';

class WPAConf {

  file;
  conf;
  nets;

  _changed = false;

  constructor(file) {
    if (!fs.existsSync(file)) {
      throw Error(`file is not exists: ${file}`);
    }
    const content = fs.readFileSync(file, 'utf-8');
    const result = parse(content);

    this.conf = result.conf;
    this.nets = result.nets;
    this.file = file;
  }

  markChanged() {
    this._changed = true;
  }

  save() {
    if (!this._changed) return;
    this._changed = false;
    let {file, conf, nets} = this;
    nets.forEach(net => {
      const props = Object.keys(net).map(name => {
        return name + '=' + net[name];
      });
      conf += '\nnetwork={\n';
      conf += '\t' + props.join('\n\t');
      conf += '\n}';
    });
    fs.writeFileSync(file, conf, {encoding: "utf-8"});
  }

  add(ssid, password, options) {
    if (password && typeof password !== 'string') {
      options = password;
      password = null;
    } else if (ssid && typeof ssid !== 'string') {
      options = ssid;
      ssid = null;
      password = null;
    }
    options = options || {};

    if (!ssid) {
      ssid = options.ssid;
    }
    delete options.ssid;

    if (!password) {
      password = options.password;
    }
    delete options.password;

    if (password && password.length < 8) {
      return Promise.reject("password must be 8 characters minimum");
    }

    const that = this;
    options = options || {};
    return new Promise((resolve, reject) => {
      let promise = Promise.resolve({ssid, ...options});
      if (password) {
        promise = promise
          .then(() => exec(`wpa_passphrase "${ssid}" "${password}"`))
          .then(result => {
            const content = result.stdout.toString('utf-8');
            let newnets = parse(content).nets;
            if (!newnets.length) {
              return false;
            }
            return {
              ...options,
              ...newnets[0]
            }
          });
      }
      return promise
        .then((newnet) => {
          const index = that.nets.findIndex(net => net.ssid === newnet.ssid);
          if (index >= 0) {
            that.nets.splice(index, 1, newnet);
          } else {
            that.nets.push(newnet);
          }

          that.markChanged();
          return true;
        })
        .then(resolve, reject);
    });
  }

  addAndSave(ssid, password, options) {
    return this.add(ssid, password, options).then(() => this.save());
  }

  remove(ssid) {
    return new Promise((resolve) => {
      const ssidToCompare = `"${ssid}"`;
      const index = this.nets.findIndex(net => net.ssid === ssidToCompare);
      if (index >= 0) {
        this.nets.splice(index, 1);
        this.markChanged();
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  removeAndSave(ssid) {
    return this.remove(ssid).then(() => this.save());
  }

}

export default WPAConf;
