import {GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt} from 'graphql';
import {personType, tripType} from './types';
import {resolvePersons, resolveTrips} from './resolver';

const Query = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    persons: {
      type: new GraphQLList(personType),
      args: {
        lastName: {
          name: 'lastName',
          type: GraphQLString
        }
      },
      resolve: resolvePersons
    },
    trips: {
      type: new GraphQLList(tripType),
      args: {
        offset: {
          name: 'offset',
          type: GraphQLInt
        },
        size: {
          name: 'size',
          type: GraphQLInt
        },
        sortBy: {
          name: 'sortBy',
          type: GraphQLString
        },
        sortDirection: {
          name: 'sortDirection',
          type: GraphQLString
        }
      },
      resolve: resolveTrips
    }
  }
});

export default Query;
