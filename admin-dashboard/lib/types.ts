export enum Role {
  CLIENT = 'CLIENT',
  FIELD_AGENT = 'FIELD_AGENT',
  STATION_MANAGER = 'STATION_MANAGER',
  STATION_ADMIN = 'STATION_ADMIN',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN'
}

export enum ReportStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  VERIFIED = 'VERIFIED',
  ASSIGNED = 'ASSIGNED',
  COLLECTED = 'COLLECTED',
  OUT_OF_COVERAGE = 'OUT_OF_COVERAGE',
  RESOLVED_ALREADY_CLEAN = 'RESOLVED_ALREADY_CLEAN'
}

export enum PriorityLevel {
  NORMAL = 'NORMAL',
  HIGH = 'HIGH'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  branchId?: number | null;
  branchName?: string;
}

export interface Report {
  id: number;
  photoUrl?: string | null;
  status: ReportStatus;
  latitude: number;
  longitude: number;
  priority: PriorityLevel;
  submitterId: number;
  assignedToId?: number | null;
  branchId?: number | null;
  createdAt: string;
  collectedAt?: string | null;
}

export interface Branch {
  id: number;
  name: string;
  zone?: string | null;
}


