"use strict";

// const regex = /^"(.+)"$/;

export function parse(lines) {
  let conf = '';
  let nets = [];
  let net, pair, value;
  let start = false;
  let firstnet = false;
  let endnetwork = true;

  if (typeof lines === 'string') {
    lines = lines.split('\n');
  }
  lines.forEach(line => {
    line = line.replace(/\t/g, '');
    if (line[0] !== "#" || (line[0] === "#" && line[3] === "k" && line.split("psk").length === 2)) {
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
        // value = pair[1];
        // value = value && value.trim();
        // if (regex.test(value)) {
        //   value = regex.exec(value)[1];
        // }
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

  return {nets, conf};
}
