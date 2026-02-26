export type DocumentStatus = "Baru" | "Diproses" | "Selesai";

export interface Destination {
    id: string;
    name: string;
    faculty: string;
    description: string;
    documentCount: number;
}

export interface StudentDocument {
    id: string;
    destinationName: string;
    documentType: string;
    submittedAt: string;
    status: DocumentStatus;
    trackingId: string;
}

export interface AdminDocument {
    id: string;
    studentName: string;
    nim: string;
    documentType: string;
    submittedAt: string;
    status: DocumentStatus;
    trackingId: string;
}

export interface UserProfile {
    name: string;
    nim: string;
    role: "mahasiswa" | "admin";
    institution?: string;
}
