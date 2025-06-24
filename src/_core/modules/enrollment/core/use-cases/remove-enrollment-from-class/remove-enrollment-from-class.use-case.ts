import { inject, injectable } from "inversify";
import { AppError } from "@/_core/shared/errors/AppError";
import { EnrollmentSymbols } from "../../../../../shared/container/modules/enrollment/symbols";
import type { ClassRepository } from "../../../infrastructure/repositories/ClassRepository";
import { RemoveEnrollmentFromClassInput } from "./remove-enrollment-from-class.input";
import { RemoveEnrollmentFromClassOutput } from "./remove-enrollment-from-class.output";

@injectable()
export class RemoveEnrollmentFromClassUseCase {
  constructor(
    @inject(EnrollmentSymbols.repositories.ClassRepository)
    private readonly classRepository: ClassRepository
  ) {}

  async execute(
    input: RemoveEnrollmentFromClassInput
  ): Promise<RemoveEnrollmentFromClassOutput> {
    const klass = await this.classRepository.findById(input.classId);

    if (!klass) {
      throw new AppError("Class not found", 404);
    }

    klass.removeEnrollment(input.enrollmentId);

    await this.classRepository.save(klass);

    return new RemoveEnrollmentFromClassOutput(klass);
  }
}
