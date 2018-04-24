import 'tweetnacl';
import 'tweetnacl-util';
import 'scrypt-async';
import {enableProdMode} from "@angular/core";

const conf = require('../lib/conf.js')

if (conf.production == true) {
  enableProdMode();
}
