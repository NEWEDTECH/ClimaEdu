import { inject, injectable } from "inversify";
import { AppError } from "@/_core/shared/errors/AppError";
import { EnrollmentSymbols } from "../../../../../shared/container/modules/enrollment/symbols";
import type { ClassRepository } from "../../../infrastructure/repositories/ClassRepository";
import { DeleteClassInput } from "./delete-class.input";
import { DeleteClassOutput } from "./delete-class.output";

@injectable()
export class DeleteClassUseCase {
  constructor(
    @inject(EnrollmentSymbols.repositories.ClassRepository)
    private readonly classRepository: ClassRepository
  ) {}

  async execute(input: DeleteClassInput): Promise<DeleteClassOutput> {
    const klass = await this.classRepository.findById(input.id);

    if (!klass) {
      throw new AppError("Class not found", 404);
    }

    await this.classRepository.delete(input.id);

    return new DeleteClassOutput(true);
  }
}
