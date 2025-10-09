import { inject, injectable } from "inversify";
import { ContentSymbols } from "../../../../../shared/container/modules/content/symbols";
import type { CourseRepository } from "../../../infrastructure/repositories/CourseRepository";
import { ListCoursesByInstitutionInput } from "./list-courses-by-institution.input";
import { ListCoursesByInstitutionOutput } from "./list-courses-by-institution.output";

@injectable()
export class ListCoursesByInstitutionUseCase {
  constructor(
    @inject(ContentSymbols.repositories.CourseRepository)
    private readonly courseRepository: CourseRepository
  ) {}

  async execute(input: ListCoursesByInstitutionInput): Promise<ListCoursesByInstitutionOutput> {
    const courses = await this.courseRepository.listByInstitution(input.institutionId);
    return new ListCoursesByInstitutionOutput(courses);
  }
}
