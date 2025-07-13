import { CustomError } from '@/utils/error'
import { getDoc, type DocumentReference } from 'firebase/firestore'

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
