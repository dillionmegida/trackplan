import type { Timestamp } from "firebase/firestore"

export type UserType = {
  id: string
  name: string
  email: string
  activeOrganizationId: string
  createdAt: Timestamp
  updatedAt: Timestamp
  onboarded: boolean
}