import { useQuery } from "@tanstack/vue-query"
import { db } from "@/configs/firebase"
import { collection, getDocs, doc } from "firebase/firestore"

export const useProgramChecklists = (programId: string) => {
  return useQuery({
    queryKey: ['program-checklists', programId],
    queryFn: async () => {
      const programRef = doc(db, 'programs', programId)
      const checklistsRef = collection(programRef, 'checklists')
      const checklistsSnapshot = await getDocs(checklistsRef)
      const checklists = checklistsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      return checklists
    },
    enabled: !!programId,
  })
}
