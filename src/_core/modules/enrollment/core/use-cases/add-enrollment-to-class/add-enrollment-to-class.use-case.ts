import { inject, injectable } from "inversify";
import { AppError } from "@/_core/shared/errors/AppError";
import { EnrollmentSymbols } from "../../../../../shared/container/modules/enrollment/symbols";
import type { ClassRepository } from "../../../infrastructure/repositories/ClassRepository";
import { AddEnrollmentToClassInput } from "./add-enrollment-to-class.input";
import { AddEnrollmentToClassOutput } from "./add-enrollment-to-class.output";

@injectable()
export class AddEnrollmentToClassUseCase {
  constructor(
    @inject(EnrollmentSymbols.repositories.ClassRepository)
    private readonly classRepository: ClassRepository
  ) {}

  async execute(
    input: AddEnrollmentToClassInput
  ): Promise<AddEnrollmentToClassOutput> {
    const klass = await this.classRepository.findById(input.classId);

    if (!klass) {
      throw new AppError("Class not found", 404);
    }

    klass.addEnrollment(input.enrollmentId);

    await this.classRepository.save(klass);

    return new AddEnrollmentToClassOutput(klass);
  }
}
