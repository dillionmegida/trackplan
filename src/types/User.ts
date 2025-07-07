import type { Timestamp } from "firebase/firestore"

export type UserType = {
  id: string
  name: string
  email: string
  organizationIds: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
  onboarded: boolean
}