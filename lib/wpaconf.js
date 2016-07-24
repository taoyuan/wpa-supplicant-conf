'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * wpa-supplicant-conf
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright © 2016 Yuan Tao. All rights reserved.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * This source code is licensed under the MIT license found in the
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * LICENSE.txt file in the root directory of this source tree.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _childProcessPromise = require('child-process-promise');

var _parser = require('./parser');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WPAConf = function () {
  function WPAConf(file) {
    _classCallCheck(this, WPAConf);

    this._changed = false;

    if (!_fs2.default.existsSync(file)) {
      throw Error('file is not exists: ' + file);
    }
    var content = _fs2.default.readFileSync(file, 'utf-8');
    var result = (0, _parser.parse)(content);

    this.conf = result.conf;
    this.nets = result.nets;
    this.file = file;
  }

  _createClass(WPAConf, [{
    key: 'markChanged',
    value: function markChanged() {
      this._changed = true;
    }
  }, {
    key: 'save',
    value: function save() {
      if (!this._changed) return;
      this._changed = false;
      var file = this.file;
      var conf = this.conf;
      var nets = this.nets;

      nets.forEach(function (net) {
        var props = Object.keys(net).map(function (name) {
          return name + '=' + net[name];
        });
        conf += '\nnetwork={\n';
        conf += '\t' + props.join('\n\t');
        conf += '\n}';
      });
      _fs2.default.writeFileSync(file, conf, { encoding: "utf-8" });
    }
  }, {
    key: 'add',
    value: function add(ssid, password, options) {
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
        return _bluebird2.default.reject("password must be 8 characters minimum");
      }

      var that = this;
      options = options || {};
      return new _bluebird2.default(function (resolve, reject) {
        var promise = _bluebird2.default.resolve(_extends({ ssid: ssid }, options));
        if (password) {
          promise = promise.then(function () {
            return (0, _childProcessPromise.exec)('wpa_passphrase "' + ssid + '" "' + password + '"');
          }).then(function (result) {
            var content = result.stdout.toString('utf-8');
            var newnets = (0, _parser.parse)(content).nets;
            if (!newnets.length) {
              return false;
            }
            return _extends({}, options, newnets[0]);
          });
        }
        return promise.then(function (newnet) {
          var index = that.nets.findIndex(function (net) {
            return net.ssid === newnet.ssid;
          });
          if (index >= 0) {
            that.nets.splice(index, 1, newnet);
          } else {
            that.nets.push(newnet);
          }

          that.markChanged();
          return true;
        }).then(resolve, reject);
      });
    }
  }, {
    key: 'addAndSave',
    value: function addAndSave(ssid, password, options) {
      var _this = this;

      return this.add(ssid, password, options).then(function () {
        return _this.save();
      });
    }
  }, {
    key: 'remove',
    value: function remove(ssid) {
      var _this2 = this;

      return new _bluebird2.default(function (resolve) {
        var ssidToCompare = '"' + ssid + '"';
        var index = _this2.nets.findIndex(function (net) {
          return net.ssid === ssidToCompare;
        });
        if (index >= 0) {
          _this2.nets.splice(index, 1);
          _this2.markChanged();
          resolve(true);
        } else {
          resolve(false);
        }
      });
    }
  }, {
    key: 'removeAndSave',
    value: function removeAndSave(ssid) {
      var _this3 = this;

      return this.remove(ssid).then(function (removed) {
        _this3.save();
        return removed;
      });
    }
  }]);

  return WPAConf;
}();

exports.default = WPAConf;
module.exports = exports['default'];