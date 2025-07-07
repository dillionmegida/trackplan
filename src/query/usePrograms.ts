import { useQuery } from '@tanstack/vue-query'
import { db } from '@/configs/firebase'
import { collection, doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { useMutation } from '@tanstack/vue-query'
import type { ProgramType } from '@/types/Program'

export const useProgramsForUser = (userId: string) => {
  return useQuery({
    queryKey: ['programs', userId],
    queryFn: async () => {
      const programsRef = collection(db, 'programs')
      const q = query(programsRef, where('organizationId', '==', userId))
      const programsSnapshot = await getDocs(q)
      const programs = programsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      return programs
    },
    enabled: !!userId,
  })
}

type UseCreateProgramArgs = {
  data: ProgramType
}

export const useCreateProgram = () => {
  return useMutation({
    mutationFn: async ({ data }: UseCreateProgramArgs) => {
      const programRef = doc(db, 'programs', data.id)
      await setDoc(programRef, data)
    },
  })
}
