import type { ProgramType } from '@/types/Program'
import { CustomError } from '@/utils/error'
import {
  getDoc,
  getDocs,
  Query,
  type DocumentData,
  type DocumentReference,
} from 'firebase/firestore'

type CheckIfDocExistsArgs = {
  docRef: DocumentReference
  errorMsg: string
}

export async function checkIfDocExists<T>({ docRef, errorMsg }: CheckIfDocExistsArgs): Promise<T> {
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) {
    throw new CustomError(errorMsg, 400)
  }

  return { id: docSnap.id, ...docSnap.data() } as T
}

export async function getDocsData<T>(arg: Query<DocumentData>): Promise<T[]> {
  const querySnapshot = await getDocs(arg)
  return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[]
}

export function authorizedToUpdateProgram({
  program,
  userId,
}: {
  program: ProgramType
  userId: string
}) {
  if (program.createdBy !== userId) {
    throw new CustomError('You are not authorized to update this program', 403)
  }
}

export function authorizedToDeleteProgram({
  program,
  userId,
}: {
  program: ProgramType
  userId: string
}) {
  // TODO: for when a user can have multiple organizations, we can't just use the user's id
  // because the user's id is just for the default organization
  if (program.organizationId !== userId) {
    throw new CustomError('You are not authorized to delete this program', 403)
  }
}