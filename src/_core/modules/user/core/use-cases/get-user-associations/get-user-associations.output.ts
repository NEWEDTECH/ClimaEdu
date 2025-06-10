import { UserRole } from "../../entities/User";

export type UserAssociation = {
  contextId: string; // ID da Instituição ou Curso
  contextName: string; // Nome da Instituição ou Curso
  role: UserRole;
  contextType: "institution" | "course";
};

export type GetUserAssociationsOutput = UserAssociation[];
