import { Trail } from "../../core/entities/Trail";

export interface TrailRepository {
  generateId(): Promise<string>;
  save(trail: Trail): Promise<void>;
  findById(id: string): Promise<Trail | null>;
  findAll(institutionId: string): Promise<Trail[]>;
  delete(id: string): Promise<void>;
}
