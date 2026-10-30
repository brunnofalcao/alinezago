export type Role = "member" | "admin";
export type MemberStatus = "pendente" | "ativo" | "inativo";
export type AttendanceStatus = "presente" | "ausente" | "justificada";
export type LeadType = "paciente" | "palestra" | "parceria" | "outro";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: Role;
  status: MemberStatus;
  tags: string[];
  notes: string | null;
  consent_whatsapp: boolean;
  last_inbound_at: string | null;
  created_at: string;
  approved_at: string | null;
}

export interface LiveClass {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  duration_min: number;
  meeting_url: string | null;
  recording_url: string | null;
  material_url: string | null;
  published: boolean;
  created_at: string;
}

export interface Attendance {
  id: string;
  class_id: string;
  profile_id: string;
  status: AttendanceStatus;
  source: "checkin" | "admin";
  checked_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  published_at: string;
}

export interface Lead {
  id: string;
  type: LeadType;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  source: string | null;
  status: "novo" | "contatado" | "encerrado";
  created_at: string;
}

export interface Interaction {
  id: string;
  profile_id: string;
  kind: "nota" | "ligacao" | "whatsapp" | "email" | "consulta";
  content: string;
  created_by: string | null;
  created_at: string;
}

export interface MessageLog {
  id: string;
  channel: "email" | "whatsapp";
  direction: "out" | "in";
  to_ref: string;
  profile_id: string | null;
  template: string | null;
  status: string;
  payload: unknown;
  created_at: string;
}
