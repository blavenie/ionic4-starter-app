import {promisify} from 'bluebird';
import {persons} from '../mockData';

function populateWithPersons(db){
  return db('persons').insert(persons)
}

export default populateWithPersons
