export type Subject = 'Mathematics' | 'Science' | 'Biology' | 'Physics' | 'Chemistry' | 'English';

export interface User {
  id: number;
  name: string;
  school: string;
  className: string;
  points: number;
  level: number;
  avatar?: string;
  badges: Badge[];
  weeklyGoal?: number;
  completedThisWeek?: number;
}

export interface Badge {
  id: number;
  badge_name: string;
  icon: string;
  date_earned: string;
}

export interface LeaderboardEntry {
  name: string;
  points: number;
  level: number;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  subject: Subject;
  updated_at: string;
}

export interface ScheduleItem {
  id: number;
  task: string;
  time: string;
  day: string;
  completed: boolean;
}

export interface Progress {
  id: number;
  subject: Subject;
  score: number;
  total: number;
  date: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  created_by: number;
  created_at: string;
  member_count?: number;
}

export interface GroupMessage {
  id: number;
  group_id: number;
  user_id: number;
  user_name: string;
  text: string;
  image?: string;
  created_at: string;
}

export interface GroupNote {
  id: number;
  group_id: number;
  title: string;
  content: string;
  updated_by: number;
  updated_by_name: string;
  updated_at: string;
}
