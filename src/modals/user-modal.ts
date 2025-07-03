

export interface UserResponse {
  statusCode: number;
  message: string;
  data: User;
}

export interface User {
  userId: number;
  userName: string;
  employeeCode: string;
  email: string;
  phone: string | null;
  department: Department;
  designation: string | null;
  reportToUserId: ReportToUser;
  roles: Role[];
}

export interface Department {
  departmentId: number;
  departmentName: string;
}

export interface ReportToUser {
  userId: number;
  userName: string;
  employeeCode: string;
  email: string;
  phone: string | null;
  departmentId: number;
  desginationId: number;
  reportToUserId: number;
}

export interface Role {
  roleId: number;
  roleName: string;
  roleDescription: string;
  hierarchyLevel: number;
}
