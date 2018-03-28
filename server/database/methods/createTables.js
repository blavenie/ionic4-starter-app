export default async function createTables(db) {
  try {
    await db.schema.createTable('persons', function (table) {
      table.increments().primary();
      table.string('firstName');
      table.string('lastName');
    });

    await db.schema.createTable('trips', function (table) {
      table.increments().primary();
      table.string('departureDateTime');
      table.string('returnDateTime');
      table.string('comments');
    });

  } catch(e){
    console.log('Database already exists!', e);
  }
}
