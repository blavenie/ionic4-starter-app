import db from '../database/index';
//import {compose, prop, head} from 'ramda'
// Hooray for Functional Programming //

//Helpers//

async function getPersonsByLastName(lastName){
  let result = await db.where('lastName', lastName).select('id', 'lastName', 'firstName').from('persons');
  return result;
}

async function getAllTrips(){
  let result = await db.select('id', 'comments', 'departureDateTime', 'returnDateTime').from('trips');
  return result;
}

//GraphQL Query Resolvers//

export async function resolvePersons(rootValue, {lastName} ){
  let result = await getPersonsByLastName(lastName);
  return result;
}

export async function resolveTrips(rootValue, {offset, size, sortBy, sortDirection} ){
  let result = await getAllTrips();
  return result;
}

//GraphQL Mutation Resolvers//

export async function resolveCreatePerson(rootValue, {firstName, lastName}){
  let newPerson = {firstName: firstName, lastName: lastName};
  await db('persons').insert(newPerson);
  return newPerson;
}
