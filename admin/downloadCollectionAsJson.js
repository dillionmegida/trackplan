const admin = require('firebase-admin');
const fs = require('fs');

// set up firebase admin
const serviceAccount = require('./serviceAccount.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const firestore = admin.firestore();

// download collection with subcollection categories and checklists as json
async function downloadCollectionAsJson(collectionName) {
  const collectionRef = firestore.collection(collectionName);
  const snapshot = await collectionRef.get();
  // const data = snapshot.docs.map((doc) => ({
  //   id: doc.id,
  //   ...doc.data(),
  // }));
  const data = []

  

  // also get categories and checklists
  for (const doc of snapshot.docs) {
    const docData = {id: doc.id, ...doc.data()}

    const categoriesSnapshot = await doc.ref.collection('categories').get();
    const categoriesData = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    docData.categories = categoriesData;
    
    const checklistsSnapshot = await doc.ref.collection('checklists').get();
    const checklistsData = checklistsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    docData.checklists = checklistsData;
    data.push(docData);
  }

  // download data as json
  fs.writeFileSync(`./data/${collectionName}.json`, JSON.stringify(data));
}

downloadCollectionAsJson('programs-demo')