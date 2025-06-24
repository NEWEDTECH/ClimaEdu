import { Enrollment } from "../../entities/Enrollment";

export class EnrollInTrailOutput {
  constructor(public readonly enrollments: Enrollment[]) {}
}
