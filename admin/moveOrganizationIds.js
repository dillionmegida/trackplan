const admin = require('firebase-admin');

// Set up Firebase Admin
const serviceAccount = require('./serviceAccount.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

async function migrateOrganizationMembers() {
  try {
    console.log('Starting migration...');

    // 1. Get all users
    const usersSnapshot = await firestore.collection('users').get();
    console.log(`Found ${usersSnapshot.size} users`);

    // 2. Create a map of organizationId to memberIds
    const orgToMembersMap = new Map();
    const users = [];

    usersSnapshot.forEach((userDoc) => {
      const userData = userDoc.data();
      const userId = userDoc.id;
      const orgIds = userData.organizationIds || [];
      
      users.push({ id: userId, orgIds });
      
      // Add user to each organization's member list
      orgIds.forEach(orgId => {
        if (!orgToMembersMap.has(orgId)) {
          orgToMembersMap.set(orgId, new Set());
        }
        orgToMembersMap.get(orgId).add(userId);
      });
    });

    console.log(`Found ${orgToMembersMap.size} unique organizations`);

    // 3. Verify organizations exist and update them with their member list
    let batch = firestore.batch();
    let orgsUpdated = 0;
    let orgsSkipped = 0;
    let batchCount = 0;
    const BATCH_LIMIT = 400; // Firestore batch limit is 500 operations

    for (const [orgId, memberIdsSet] of orgToMembersMap) {
      const orgRef = firestore.collection('organizations').doc(orgId);
      const orgDoc = await orgRef.get();
      
      if (!orgDoc.exists) {
        console.warn(`Warning: Organization ${orgId} not found but referenced by ${memberIdsSet.size} users`);
        orgsSkipped++;
        continue;
      }
      
      const memberIds = Array.from(memberIdsSet);
      batch.update(orgRef, { memberIds });
      orgsUpdated++;
      batchCount++;

      // Execute batch if we hit the limit
      if (batchCount >= BATCH_LIMIT) {
        console.log(`Committing batch of ${batchCount} updates...`);
        await batch.commit();
        batch = firestore.batch(); // Start a new batch
        batchCount = 0;
      }
    }

    // Commit any remaining operations in the batch
    if (batchCount > 0) {
      console.log(`Committing final batch of ${batchCount} updates...`);
      await batch.commit();
    }

    console.log(`Migration complete!`);
    console.log(`- Updated ${orgsUpdated} organizations.`);
    if (orgsSkipped > 0) {
      console.warn(`- Skipped ${orgsSkipped} organizations that were referenced but don't exist.`);
    }
    console.log('Note: User documents still contain organizationIds. You may want to remove these in a follow-up migration.');

  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the migration
migrateOrganizationMembers();