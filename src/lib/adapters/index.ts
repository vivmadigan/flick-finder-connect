/**
 * Centralized adapter layer for API ↔ UI type conversions
 * 
 * This module provides typed adapters that transform backend DTOs to frontend types
 * and vice versa. All API ↔ UI conversions should go through these adapters to ensure
 * consistency and type safety.
 */

import { 
  Preferences, 
  Genre, 
  LengthBucket, 
  ChatMessage, 
  Conversation,
  MatchCandidate
} from '@/types';

// ============================================================================
// Backend DTO Types (what the API actually returns)
// ============================================================================

export interface PreferencesDTO {
  genreIds: number[];
  length: string;
}

export interface BackendMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderDisplayName: string;  // ⚠️ Different property name
  text: string;               // ⚠️ Different property name
  sentAt: string;             // ⚠️ ISO 8601 DateTime string
}

export interface BackendConversation {
  roomId: string;
  otherUserId: string;
  otherDisplayName: string;
  tmdbId: number | null;
  lastText: string | null;
  lastAt: string | null;  // ISO 8601 DateTime string
}

export interface BackendMatchCandidate {
  userId: string;
  displayName: string;
  overlapCount: number;
  sharedMovieIds: number[];
  sharedMovies: Array<{
    tmdbId: number;
    title: string;
    posterUrl: string;
    releaseYear?: string | null;
  }>;
  matchStatus: 'none' | 'pending_sent' | 'pending_received' | 'matched';
  requestSentAt?: string | null;
}

export interface MatchResponseDTO {
  matched: boolean;
  roomId: string | null;
}

// ============================================================================
// Genre Mapping Constants
// ============================================================================

export const GENRE_NAME_TO_ID: Record<Genre, number> = {
  Action: 28,
  Comedy: 35,
  Drama: 18,
  Horror: 27,
  Romance: 10749,
  'Sci-Fi': 878,
  Thriller: 53,
  Animated: 16,
  Documentary: 99,
  Fantasy: 14,
  Western: 37,
  Crime: 80,
  '80s': 0, // Placeholder - not a TMDB genre
  '90s': 0, // Placeholder - not a TMDB genre
  'Academy Award Winners': 0, // Placeholder
  'Feel-good': 0, // Placeholder
  'Cult Classics': 0, // Placeholder
};

export const GENRE_ID_TO_NAME: Record<number, Genre> = {
  28: 'Action',
  35: 'Comedy',
  18: 'Drama',
  27: 'Horror',
  10749: 'Romance',
  878: 'Sci-Fi',
  53: 'Thriller',
  16: 'Animated',
  99: 'Documentary',
  14: 'Fantasy',
  37: 'Western',
  80: 'Crime',
};

// ============================================================================
// Preferences Adapter
// ============================================================================

export const PreferencesAdapter = {
  /**
   * Convert frontend Preferences to backend PreferencesDTO
   * Frontend: { genre: "Action", lengthBucket: "medium" }
   * Backend:  { genreIds: [28], length: "medium" }
   */
  toDTO(prefs: Preferences): PreferencesDTO {
    const genreId = GENRE_NAME_TO_ID[prefs.genre];
    return {
      genreIds: [genreId],
      length: prefs.lengthBucket,
    };
  },

  /**
   * Convert backend PreferencesDTO to frontend Preferences
   * Backend:  { genreIds: [28], length: "medium" }
   * Frontend: { genre: "Action", lengthBucket: "medium" }
   */
  fromDTO(dto: PreferencesDTO): Preferences {
    const firstGenreId = dto.genreIds[0];
    const genre = GENRE_ID_TO_NAME[firstGenreId] || 'Action';
    return {
      genre,
      lengthBucket: dto.length as LengthBucket,
    };
  },
};

// ============================================================================
// Chat Adapter
// ============================================================================

export const ChatAdapter = {
  /**
   * Convert backend message to frontend ChatMessage
   * Backend:  { senderDisplayName, text, sentAt: "2024-01-15T10:30:00Z" }
   * Frontend: { senderName, content, timestamp: Date }
   */
  messageFromDTO(dto: BackendMessage): ChatMessage {
    return {
      id: dto.id,
      roomId: dto.roomId,
      senderId: dto.senderId,
      senderName: dto.senderDisplayName,  // ⚠️ Property name change
      content: dto.text,                  // ⚠️ Property name change
      timestamp: new Date(dto.sentAt),    // ⚠️ String to Date conversion
    };
  },

  /**
   * Convert backend conversation to frontend Conversation
   * Backend:  { otherDisplayName, lastText, lastAt: "2024-01-15T10:30:00Z" }
   * Frontend: { otherUser: { displayName }, lastMessage, lastMessageTime: Date }
   */
  conversationFromDTO(dto: BackendConversation): Conversation {
    return {
      id: dto.roomId,
      roomId: dto.roomId,
      otherUser: {
        id: dto.otherUserId,
        email: '',  // Backend doesn't provide email in chat context
        displayName: dto.otherDisplayName,
        avatar: undefined,  // Backend doesn't provide avatar URLs yet
      },
      lastMessage: dto.lastText || undefined,
      lastMessageTime: dto.lastAt ? new Date(dto.lastAt) : undefined,
      unreadCount: 0,  // Backend doesn't track unread count yet
    };
  },
};

// ============================================================================
// Match Adapter
// ============================================================================

export const MatchAdapter = {
  /**
   * Convert backend candidate to frontend MatchCandidate
   * Handles matchStatus enum and requestSentAt timestamp conversion
   */
  candidateFromDTO(dto: BackendMatchCandidate): MatchCandidate {
    return {
      userId: dto.userId,
      displayName: dto.displayName,
      overlapCount: dto.overlapCount,
      sharedMovieIds: dto.sharedMovieIds,
      sharedMovies: dto.sharedMovies,
      matchStatus: dto.matchStatus,
      requestSentAt: dto.requestSentAt || undefined,
    };
  },

  /**
   * Convert match response DTO
   */
  matchResponseFromDTO(dto: MatchResponseDTO): { matched: boolean; roomId: string | null } {
    return {
      matched: dto.matched,
      roomId: dto.roomId,
    };
  },
};
