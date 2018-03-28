import {GraphQLObjectType, GraphQLString} from 'graphql';
import {personType} from './types';
import {resolveCreatePerson} from './resolver';

const Mutation = new GraphQLObjectType({
  name: 'RootMutationType',
  fields: {
    createPerson: {
      type: personType,
      args: {
        name: {
          name: 'name',
          type: GraphQLString
        }
      },
      resolve: resolveCreatePerson
    }
  }
});

export default Mutation;
