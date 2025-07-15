const admin = require('firebase-admin');

// set up firebase admin
const serviceAccount = require('./serviceAccount.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


const firestore = admin.firestore();
async function duplicateCollection(source, destination) {
  // First copy main documents
  const snapshot = await firestore.collection(source).get();
  const batch = firestore.batch();
  
  // Process main documents
  const mainDocs = [];
  snapshot.forEach((doc) => {
    const destRef = firestore.collection(destination).doc(doc.id);
    batch.set(destRef, doc.data());
    mainDocs.push({
      sourceRef: doc.ref,
      destRef: destRef
    });
  });
  await batch.commit();

  // Process subcollections for each main document
  for (const { sourceRef, destRef } of mainDocs) {
    // Copy categories subcollection
    const categoriesSnapshot = await sourceRef.collection('categories').get();
    const categoriesBatch = firestore.batch();
    
    categoriesSnapshot.forEach((catDoc) => {
      const catDestRef = destRef.collection('categories').doc(catDoc.id);
      categoriesBatch.set(catDestRef, catDoc.data());
    });
    await categoriesBatch.commit();

    // Copy checklists subcollection
    const checklistsSnapshot = await sourceRef.collection('checklists').get();
    const checklistsBatch = firestore.batch();
    
    checklistsSnapshot.forEach((checklistDoc) => {
      const checklistDestRef = destRef.collection('checklists').doc(checklistDoc.id);
      checklistsBatch.set(checklistDestRef, checklistDoc.data());
    });
    await checklistsBatch.commit();
  }
}

duplicateCollection('programs', 'programs-demo');