export interface Inquiry {
  id: string;
  uid: string | null;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  projectType: string;
  budget?: string;
  idea: string;
  status: 'NEW' | 'REPLIED' | 'IN PROGRESS' | 'CLOSED';
  deployedUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'client' | 'admin';
  senderName?: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  deliverables: string[];
  icon: string;
}

export interface SiteContent {
  heroTitle: string;
  heroSubtitle: string;
  positioningHeadline: string;
  positioningBody: string;
  services: ServiceItem[];
}
