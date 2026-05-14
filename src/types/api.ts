export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiListEnvelope<T> = {
  success: boolean;
  data: T[];
  meta: Paginated<T>['items'] extends infer _ ? { total: number; page: number; limit: number; totalPages: number } : never;
};

export type StudentDto = {
  id: string;
  schoolId: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  classId: string;
  sectionId?: string | null;
  isActive: boolean;
};
