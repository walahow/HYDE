import { DocumentStatus as PrismaDocumentStatus, TransactionMode as PrismaTransactionMode, Role } from "@prisma/client";

export type DocumentStatus = PrismaDocumentStatus;
export type TransactionMode = PrismaTransactionMode;

export interface UserProfile {
  id: string;
  autoId: number;
  nim: string;
  name: string;
  role: Role;
  destinationName?: string | null;
  categoryCode?: string | null;
  acceptedDocuments?: string[];
  isOpen?: boolean | null;
}

export interface Transaction {
  id: string;
  documentType: string; // decrypted at app layer for involved users
  status: DocumentStatus;
  mode: TransactionMode;
  createdAt: Date;
  completedAt?: Date | null;
  scannedAt?: Date | null;
  studentId: string;
  adminId: string;
  
  // Optional relations
  student?: UserProfile;
  admin?: UserProfile;
  files?: TransactionFile[];
  messages?: Message[];
  statusLogs?: StatusLog[];
}

export interface TransactionFile {
  id: string;
  transactionId: string;
  fileUrl: string;
  originalFileName: string; // decrypted at app layer
  uploadedById: string;
  uploadedAt: Date;
}

export interface Message {
  id: string;
  transactionId: string;
  senderId: string;
  senderRole: Role;
  content: string;
  createdAt: Date;
}

export interface StatusLog {
  id: string;
  transactionId: string;
  changedById: string;
  fromStatus: DocumentStatus | null;
  toStatus: DocumentStatus;
  note: string | null;
  changedAt: Date;
}
