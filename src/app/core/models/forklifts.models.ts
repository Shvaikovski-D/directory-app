export interface ForkliftItemDto {
  id: number;
  brand: string;
  number: string;
  loadCapacity: number;
  isActive: boolean;
  lastModified: string;
  lastModifiedBy: string | null;
}

export interface CreateForkliftCommand {
  brand: string;
  number: string;
  loadCapacity: number;
}

export interface UpdateForkliftCommand {
  id: number;
  brand: string;
  number: string;
  loadCapacity: number;
  isActive: boolean;
}

export interface PagedResultModelOfForkliftItemDto {
  items: ForkliftItemDto[];
  page: number;
  perPage: number;
  totalCount: number;
  totalPages: number;
}