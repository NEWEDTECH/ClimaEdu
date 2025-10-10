import { Course } from "../../entities/Course";

export class ListCoursesByInstitutionOutput {
  constructor(public readonly courses: Course[]) {}
}
