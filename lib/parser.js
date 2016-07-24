"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parse = parse;
function parse(lines) {
  var conf = '';
  var nets = [];
  var net = void 0,
      pair = void 0;
  var start = false;
  var firstnet = false;
  var endnetwork = true;

  if (typeof lines === 'string') {
    lines = lines.split('\n');
  }
  lines.forEach(function (line) {
    line = line.replace(/\t/g, '');
    if (line[0] !== "#" || line[0] === "#" && line[3] === "k" && line.split("psk").length === 2) {
      if (line.split("etwork").length === 2 && endnetwork) {
        start = true;
        firstnet = true;
        endnetwork = false;
        net = {};
      } else if (line.replace(/ /g, "")[0] === "}" && firstnet) {
        endnetwork = true;
        firstnet = false;
        nets.push(net);
      } else if (firstnet && (pair = line.split("=")) && pair.length == 2) {
        net[pair[0].replace(/ /g, "")] = pair[1];
      } else if (!start && line) {
        if (conf != "") {
          conf = conf + "\n" + line;
        } else {
          conf = line;
        }
      }
    }
  });

  return { nets: nets, conf: conf };
}