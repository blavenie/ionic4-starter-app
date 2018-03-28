import knex from 'knex';
import {promisify} from 'bluebird';
import {createTables, insertPersons, insertTrips} from './methods';

let {log} = console;

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './db.sqlite'
  }
});

async function initialize(){
  await createTables(db);
  await insertPersons(db);
  await insertTrips(db);
  return db.select('comments').from('trips')
    .then((rows) => log(rows));
}

initialize();
export default db;
