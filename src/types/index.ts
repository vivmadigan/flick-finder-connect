export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

export interface Movie {
  id: string;
  title: string;
  year: number;
  runtime: number;
  poster: string;
  genres: Genre[];
  lengthBucket: LengthBucket;
  rating?: number;
  synopsis: string;
}

export interface Conversation {
  id: string;
  roomId: string;
  otherUser: User;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
}

export type Genre = 
  | 'Action'
  | 'Comedy'
  | 'Drama'
  | 'Romance'
  | 'Thriller'
  | 'Sci-Fi'
  | 'Fantasy'
  | 'Horror'
  | 'Western'
  | 'Crime'
  | '80s'
  | '90s'
  | 'Academy Award Winners'
  | 'Animated'
  | 'Documentary'
  | 'Feel-good'
  | 'Cult Classics';

export type LengthBucket = 'short' | 'medium' | 'long';

export interface Preferences {
  genre?: Genre;
  lengthBucket?: LengthBucket;
}

export interface Match {
  id: string;
  user: User;
  sharedMovies: Movie[];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
}

export interface ChatRoom {
  id: string;
  participants: User[];
  messages: ChatMessage[];
  match: Match;
}

export interface AuthResponse {
  user: User;
  token: string;
}
