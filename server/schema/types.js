import {
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLString,
  GraphQLInt,
  GraphQLList
} from 'graphql';
//import GraphQLLong from 'graphql-type-long';

export const personType = new GraphQLObjectType({
  name: 'Person',
  description: 'a person',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
      description: 'a person\'s id',
    },
    firstName: {
      type: GraphQLString,
      description: 'a person\'s first name',
    },
    lastName: {
      type: GraphQLString,
      description: 'a person\'s last name'
    }
  })
});

export const referentialType = new GraphQLObjectType({
  name: 'Referential',
  description: 'a referential entity',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'an id',
    },
    label: {
      type: GraphQLString,
      description: 'a label',
    },
    name: {
      type: GraphQLString,
      description: 'a name',
    }
  })
});

export const tripType = new GraphQLObjectType({
  name: 'Trip',
  description: 'a fishing trip',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLInt),
      description: 'a trip\'s id'
    },
    comments: {
      type: GraphQLString,
      description: 'a trip\'s comment'
    },
    departureDateTime: {
      type: GraphQLString,
      description: 'a trip\'s departure datetime'
    },
    returnDateTime: {
      type: GraphQLString,
      description: 'a trip\'s return datetime'
    },
    creationDate: {
      type: GraphQLString,
      description: 'a trip\'s creation date'
    },
    updateDate: {
      type: GraphQLString,
      description: 'a trip\'s update date'
    },
    departureLocation: {
      type: referentialType,
      description: 'a trip\'s departure location'
    },
    returnLocation: {
      type: referentialType,
      description: 'a trip\'s return location'
    },
    vesselId: {
      type: GraphQLInt,
      description: 'a trip\'s vessel id'
    },
    recorderDepartment: {
      type: referentialType,
      description: 'a trip\'s recorder department'
    }
  })
});
