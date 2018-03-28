
const express = require('express');
const graphqlHTTP = require('express-graphql');
var cors = require('cors');
var Schema = require('./schema');
var db = require('./database');

const app = express();
let { log } = console;

app.use('*', cors());

app.use('/graphql', cors(), graphqlHTTP({
  schema: Schema,
  graphiql: true
}));

const server = app.listen(7777, () => {
  let { address, port } = server.address();
  log(`graphql server listening at ${address} on port ${port}`);
});

