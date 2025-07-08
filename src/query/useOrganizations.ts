import { useMutation, useQuery } from "@tanstack/vue-query"
import { db } from "@/configs/firebase"
import { collection, doc, setDoc, getDocs, where, query, updateDoc } from "firebase/firestore"
import type { OrganizationType } from "@/types/Organization"
import { queryClient } from "@/configs/react-query"
import { toast } from "vue3-toastify"

export const useCreateOrganization = () => {
  return useMutation({
    mutationFn: async ({ data }: { data: OrganizationType }) => {
      const organizationRef = doc(db, 'organizations', data.id)
      await setDoc(organizationRef, data)

      return { id: data.id }
    },
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({ queryKey: ['organizations', id] })
    },
    onError: () => {
      toast.error('Failed to create organization. Please try again.')
    },
  })
}

export const useSelectActiveOrganization = (userId: string) => {
  return useMutation({
    mutationFn: async ({ organizationId }: { organizationId: string }) => {
      const userRef = doc(db, 'users', userId)
      await updateDoc(userRef, { activeOrganizationId: organizationId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] })
    },
    onError: () => {
      toast.error('Failed to select organization. Please try again.')
    },
  })
}

export const useOrganizationsForUser = (userId: string) => {
  return useQuery({
    queryKey: ['organizations', userId],
    queryFn: async () => {
      const organizationsRef = collection(db, 'organizations')
      const q = query(organizationsRef, where('createdBy', '==', userId))
      const organizationsSnapshot = await getDocs(q)
      const organizations = organizationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      return organizations as OrganizationType[]
    },
  })
}
