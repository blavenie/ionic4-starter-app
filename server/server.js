var userSchema = require('./user/user.schema').userSchema;

const express = require('express');
const graphqlHTTP = require('express-graphql');
var cors = require('cors');

const app = express();
app.use('*', cors());

app.use('/graphql', cors(), graphqlHTTP({
  schema: userSchema,
  graphiql: true
}));

app.listen(4000);