const monk = require('monk');
require('dotenv').load();

function getCollections(connectionURI){
  const db = monk(connectionURI);
  db.options = {
    castIds : false
  };

  return {
    User: db.get('users'),
    Student: db.get('students'),
    Instructor: db.get('instructors'),
    Performance: db.get('performances'),
    Evidence: db.get('evidences'),
    Resource: db.get('resources'),
    Note: db.get('notes'),
    StandardCollection: db.get('standard_collection')
  }
}

const devCollections = getCollections(process.env.MONGO_URI);
const productionCollections = getCollections(process.env.PRODUCTION_MONGO_URI);

Promise.all(Object.keys(devCollections).map(collectionName => {
  return devCollections[collectionName]
    .remove()
    .then(() => {
      console.log('Cleared Dev', collectionName);
      return productionCollections[collectionName]
        .find()
        .then(documents => {
          console.log('Retrieved Prod', collectionName);
          return devCollections[collectionName]
            .insert(documents)
            .then(() => {
              console.log('Inserted Dev', collectionName);
            });
        });
    });
})).then(() => {
  console.log('Done!');
});
