import {NgModule} from '@angular/core';
import {HttpClientModule, HttpHeaders} from '@angular/common/http';
import {GC_AUTH_TOKEN} from '../constants';
// Apollo
import {Apollo, ApolloModule} from 'apollo-angular';
import {HttpLink, HttpLinkModule} from 'apollo-angular-link-http';
import {InMemoryCache} from 'apollo-cache-inmemory';
import {ApolloLink} from 'apollo-link';
import {getOperationAST} from 'graphql';
import {WebSocketLink} from 'apollo-link-ws';


const conf = require('../../lib/conf.js')

/* Hack on Websocket, to avoid the use of protocol */
declare let window: any;
const _global = typeof global !== 'undefined' ? global : (typeof window !== 'undefined' ? window : {});
const NativeWebSocket = _global.WebSocket || _global.MozWebSocket;
var AppWebSocket = function(url: string, protocols?: string | string[]){
  const self = new NativeWebSocket(url/*no protocols*/);
  return self;
} as any;
AppWebSocket.CLOSED = NativeWebSocket.CLOSED;
AppWebSocket.CLOSING = NativeWebSocket.CLOSING;
AppWebSocket.CONNECTING  = NativeWebSocket.CONNECTING;
AppWebSocket.OPEN  = NativeWebSocket.OPEN;

WebSocket
@NgModule({
  exports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ]
})
export class AppGraphQLModule {
  constructor(apollo: Apollo,
              httpLink: HttpLink) {

    console.info("[app] Creating apollo module...");

    const token = localStorage.getItem(GC_AUTH_TOKEN);
    const authorization = token ? `Bearer ${token}` : null;
    const headers = new HttpHeaders().append('Authorization', authorization);

    const http = httpLink.create({ uri: conf.baseUrl + '/graphql'});

    const wsUrl = String.prototype.replace.call(conf.baseUrl, "http", "ws");
    const ws = new WebSocketLink({
      uri: wsUrl + '/subscriptions/websocket',
      options: {
        reconnect: true
        /*,
        connectionParams: {
          authToken: localStorage.getItem(GC_AUTH_TOKEN),
        }*/
        ,
      },
      webSocketImpl: AppWebSocket
    });


    // create Apollo
    apollo.create({
      link: ApolloLink.split(
        operation => {
          const operationAST = getOperationAST(operation.query, operation.operationName);
          return !!operationAST && operationAST.operation === 'subscription';
        },
        ws,
        http,
      ),
      cache: new InMemoryCache()
    });
  }
}
