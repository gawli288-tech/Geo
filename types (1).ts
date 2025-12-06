export interface Coordinates {
  lat: number;
  lng: number;
}

export interface UserProfile {
  id: string;
  name: string;
  avatar: string; // URL
  isSelf: boolean;
}

export enum LocationStatus {
  MOVING = 'Moving',
  STATIONARY = 'Stationary',
  UNKNOWN = 'Unknown',
}

export interface LocationHistoryItem {
  id: string;
  location: Coordinates;
  timestamp: Date;
  label?: string; // Optional place name
}

export interface Friend extends UserProfile {
  location: Coordinates;
  lastUpdated: Date;
  status: LocationStatus;
  batteryLevel: number;
  phone: string;
  history: LocationHistoryItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  relatedFriendId?: string;
  groundingUrls?: string[];
}

export interface ViewState {
  center: Coordinates;
  zoom: number;
  selectedFriendId: string | null;
}