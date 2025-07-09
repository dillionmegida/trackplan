import type { Timestamp } from "firebase/firestore";

export type ProgramType = {
  id: string;
  title: string;
  description: string
  date: Timestamp
  organizationId: string
  createdBy: string
  createdAt: Timestamp
  updatedBy: string
  updatedAt: Timestamp
  trashDate: Timestamp | null
  color?: string
}