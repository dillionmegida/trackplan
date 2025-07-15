import type { UserType } from "@/types/User";
import { serverTimestamp, Timestamp } from "firebase/firestore";

export const demoUser: UserType = {
  id: 'demo',
  name: 'Demo User',
  email: 'demo@trackplan.com',
  organizationIds: ['demo'],
  activeOrganizationId: 'demo',
  createdAt: serverTimestamp() as Timestamp,
  updatedAt: serverTimestamp() as Timestamp,
  onboarded: true,
  photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocJQuyhTamPH0N52Z0lPZ7KZX06mW0zWbcDvxcPqSU2xt0lLH00ssQ=s96-c'
}