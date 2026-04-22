export interface DashboardRecentSupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  userFullName: string;
  status: string;
  createdAt: string;
  lastActivityAt: string;
}

export interface DashboardRecentSupportTicketResponse {
  items: DashboardRecentSupportTicket[];
}
