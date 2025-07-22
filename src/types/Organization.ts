import type { Timestamp } from "firebase/firestore"

export type OrganizationType = {
  id: string
  name: string
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
  updatedBy: string
  memberIds: string[]
}
