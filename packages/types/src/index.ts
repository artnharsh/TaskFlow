/**
 * TaskFlow Shared TypeScript Interfaces & Types
 */

// ==================== Core Database Entities ====================

export type Priority = "low" | "medium" | "high" | "urgent";
export type BoardRole = "owner" | "admin" | "member";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  created_at: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string | null;
  color?: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
  is_owner?: boolean;
  task_count?: number | string;
  member_count?: number | string;
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
}

export interface Task {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description?: string | null;
  priority: Priority;
  due_date?: string | null;
  assignee_id?: string | null;
  position: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  assignee_name?: string | null;
  assignee_email?: string | null;
  assignee_avatar?: string | null;
}

export interface BoardMember {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  role: BoardRole;
  joined_at: string;
}

export interface ActivityLog {
  id: string;
  board_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string | null;
  action: string;
  details?: Record<string, any> | null;
  created_at: string;
}

// ==================== API Request DTOs ====================

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateBoardDTO {
  title: string;
  description?: string;
  color?: string;
}

export interface UpdateBoardDTO {
  title?: string;
  description?: string;
  color?: string;
}

export interface CreateColumnDTO {
  title: string;
}

export interface UpdateColumnDTO {
  title?: string;
  position?: number;
}

export interface CreateTaskDTO {
  column_id: string;
  title: string;
  description?: string;
  priority?: Priority;
  due_date?: string;
  assignee_id?: string;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  priority?: Priority;
  due_date?: string;
  assignee_id?: string | null;
}

export interface MoveTaskDTO {
  column_id: string;
  position: number;
}

export interface AddMemberDTO {
  email: string;
  role?: BoardRole;
}

// ==================== AI Payloads ====================

export interface AISuggestedTask {
  title: string;
  description: string;
  priority: Priority;
}

export interface AIGenerateTasksRequest {
  goal: string;
  count?: number;
  column_id?: string;
  persist?: boolean;
}

export interface AIBreakdownRequest {
  taskId?: string;
  title?: string;
  description?: string;
  count?: number;
}

export interface AISummaryResponse {
  headline: string;
  completed: string[];
  inProgress: string[];
  risks: string[];
  recommendations: string[];
}

// ==================== WebSocket Event Definitions ====================

export interface SocketEvents {
  "task:created": Task;
  "task:updated": Task;
  "task:moved": Task;
  "task:deleted": { id: string };
  "column:created": Column;
  "column:updated": Column;
  "column:deleted": { id: string };
  "board:updated": Board;
  "activity:logged": ActivityLog;
}
