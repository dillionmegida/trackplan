const { initializeApp } = require('firebase/app')
const { getFirestore, collection, getDocs, writeBatch, query } = require('firebase/firestore')
const admin = require('firebase-admin')
const serviceAccount = require('./serviceAccount.json')

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  ignoreUndefinedProperties: true
})

const db = admin.firestore()

async function validateAndFixPrograms() {
  try {
    const programsRef = db.collection('programs')
    const snapshot = await programsRef.get()
    
    let fixedCount = 0
    let alreadyValidCount = 0
    const batch = db.batch()
    
    for (const doc of snapshot.docs) {
      const program = { id: doc.id, ...doc.data() }
      let needsUpdate = false
      
      // Initialize memberIds if it doesn't exist
      if (!program.memberIds) {
        program.memberIds = []
        needsUpdate = true
      }
      
      // Check if createdBy is in memberIds
      if (!program.memberIds.includes(program.createdBy)) {
        program.memberIds.push(program.createdBy)
        needsUpdate = true
      }
      
      // Clean memberIds: remove undefined/null values and duplicates
      const cleanMemberIds = program.memberIds
        .filter(id => id != null && id !== '') // Remove null, undefined, and empty strings
        .filter((id, index, self) => self.indexOf(id) === index) // Remove duplicates
      
      // Check if cleaning is needed
      if (cleanMemberIds.length !== program.memberIds.length) {
        program.memberIds = cleanMemberIds
        needsUpdate = true
      }
      
      if (needsUpdate) {
        console.log(`Updating program ${program.id}:`)
        console.log(`- Added createdBy to memberIds: ${!program.memberIds.includes(program.createdBy)}`)
        console.log(`- Removed duplicate memberIds: ${cleanMemberIds.length !== program.memberIds.length}`)
        
        const programRef = programsRef.doc(program.id)
        batch.update(programRef, {
          memberIds: program.memberIds
        })
        fixedCount++
      } else {
        alreadyValidCount++
      }
    }
    
    if (fixedCount > 0) {
      console.log(`\nCommitting ${fixedCount} updates to Firestore...`)
      await batch.commit()
      console.log('Updates committed successfully!')
    } else {
      console.log('No updates needed.')
    }
    
    console.log(`\nSummary:`)
    console.log(`- Programs fixed: ${fixedCount}`)
    console.log(`- Programs already valid: ${alreadyValidCount}`)
    console.log(`- Total programs processed: ${snapshot.size}`)
    
  } catch (error) {
    console.error('Error validating programs:', error)
  } finally {
    process.exit(0)
  }
}

// Run the function
validateAndFixPrograms()