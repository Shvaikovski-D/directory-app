export interface DowntimeItemDto {
  id: number;
  forkliftId: number;
  forkliftNumber: string;
  startedAt: string;
  endedAt: string | null;
  description: string;
}

export interface CreateDowntimeCommand {
  forkliftId: number;
  startedAt: string;
  endedAt: string | null;
  description: string;
}

export interface UpdateDowntimeCommand {
  id: number;
  startedAt: string;
  endedAt: string | null;
  description: string;
}