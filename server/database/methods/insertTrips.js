import {promisify} from 'bluebird';
import {trips} from '../mockData';

function populateWithTrips(db){

  let rows = trips.map((trip) => {
    return trip
  });

  return db('trips').insert(rows)
}

export default populateWithTrips
