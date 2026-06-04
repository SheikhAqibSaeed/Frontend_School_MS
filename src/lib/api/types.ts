/** Standard API envelope from Nest `TransformInterceptor` / `AllExceptionsFilter`. */
export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: PaginationMeta;
};

export type ApiErrorBody = {
  success: false;
  statusCode: number;
  path?: string;
  message: string | string[];
  details?: unknown;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: PaginationMeta;
};

export type SchoolOverview = {
  schoolId?: string;
  students?: number;
  teachers?: number;
  staff?: number;
  openInvoices?: number;
  classes?: number;
  sections?: number;
  activeExams?: number;
  activeRoutes?: number;
  studentsOnTransport?: number;
  announcements?: number;
  attendanceToday?: number;
};
