// 用户信息
export interface User {
  id: string;
  email: string;
  created_at: string;
}

// 教会设置
export interface ChurchSettings {
  id: string;
  user_id: string;
  church_name: string;
  pastor_name: string;
  email_signature: string;
  website?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

// 访客信息
export interface Visitor {
  name: string;
  email: string;
  phone?: string;
  how_heard?: string;
  interests?: string;
  first_visit_date: string;
}

// 邮件序列（一封邮件）
export interface Email {
  week: number;
  subject: string;
  body: string;
}

// 邮件序列（完整6周）
export interface EmailSequence {
  visitor: Visitor;
  emails: Email[];
  generated_at: string;
}

// 每周通讯要点
export interface NewsletterInput {
  week_date: string;
  sermon_title?: string;
  upcoming_events?: string;
  prayer_requests?: string;
  announcements?: string;
  other_notes?: string;
}

// 生成的通讯内容
export interface NewsletterContent {
  input: NewsletterInput;
  content: string;
  generated_at: string;
}

// 订阅计划
export type SubscriptionPlan = 'free' | 'pro' | 'church';
