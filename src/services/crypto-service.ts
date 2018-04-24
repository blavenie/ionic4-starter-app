import {Injectable} from "@angular/core";
import {sign, box} from "tweetnacl";
const scrypt = require('scrypt-async')
const nacl = {
  sign: sign,
  box: box,
  util: require('tweetnacl-util'),
  constants: {
    crypto_sign_BYTES: 64,
    SEED_LENGTH: 32, // Length of the key
    SCRYPT_PARAMS: {
      SIMPLE: {
        N: 2048,
        r: 8,
        p: 1,
        memory: -1 // default
      },
      DEFAULT: {
        N: 4096,
        r: 16,
        p: 1,
        memory: -1 // default
      },
      SECURE: {
        N: 16384,
        r: 32,
        p: 2,
        memory: -1 // default
      },
      HARDEST: {
        N: 65536,
        r: 32,
        p: 4,
        memory: -1 // default
      },
      EXTREME: {
        N: 262144,
        r: 64,
        p: 8,
        memory: -1 // default
      }
    }
  }
};

export interface CryptoSaltParams {
  N: number;
  r: number;
  p: number;
}
export interface KeyPair {
  publicKey: Uint8Array,
  secretKey: Uint8Array
}

@Injectable()
export class CryptoService {

  /**
   * Generate sign keypair, sugin scrypt, from a salt and a password
   * @param salt 
   * @param password 
   * @param scryptParams 
   */
  public scryptKeypair(salt: string, password:string, scryptParams?: CryptoSaltParams): Promise<KeyPair> {
    
    return new Promise((resolve) => {
        scrypt(password, salt, {
          N: scryptParams && scryptParams.N || nacl.constants.SCRYPT_PARAMS.DEFAULT.N,
          r: scryptParams && scryptParams.r || nacl.constants.SCRYPT_PARAMS.DEFAULT.r,
          p: scryptParams && scryptParams.p || nacl.constants.SCRYPT_PARAMS.DEFAULT.p,
          dkLen: nacl.constants.SEED_LENGTH,
          encoding: 'base64'
        }, function(derivedKey) {
          resolve(derivedKey);
        });
      })
      .then((seed) => {
        const byteseed = nacl.util.decodeBase64(seed);
        const signKeypair = nacl.sign.keyPair.fromSeed(byteseed);
        return {
          publicKey: signKeypair.publicKey,
          secretKey: signKeypair.secretKey
        };
      });
  }

  /**
  * Sign a message, from a key pair
  */
  public sign(message, keypair: KeyPair): Promise<string> {
    return new Promise((resolve) => {
      const m = nacl.util.decodeUTF8(message);
      const signedMsg = nacl.sign(m, keypair.secretKey);
      const sig = new Uint8Array(nacl.constants.crypto_sign_BYTES);
      for (var i = 0; i < sig.length; i++) sig[i] = signedMsg[i];
      const signature = nacl.util.encodeBase64(sig);
      resolve(signature);
    });
  };

  

}
