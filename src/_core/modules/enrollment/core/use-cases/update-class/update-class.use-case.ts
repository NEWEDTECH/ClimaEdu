import { inject, injectable } from "inversify";
import { AppError } from "@/_core/shared/errors/AppError";
import { EnrollmentSymbols } from "../../../../../shared/container/modules/enrollment/symbols";
import type { ClassRepository } from "../../../infrastructure/repositories/ClassRepository";
import { UpdateClassInput } from "./update-class.input";
import { UpdateClassOutput } from "./update-class.output";

@injectable()
export class UpdateClassUseCase {
  constructor(
    @inject(EnrollmentSymbols.repositories.ClassRepository)
    private readonly classRepository: ClassRepository
  ) {}

  async execute(input: UpdateClassInput): Promise<UpdateClassOutput> {
    const klass = await this.classRepository.findById(input.id);

    if (!klass) {
      throw new AppError("Class not found", 404);
    }

    if (input.name) {
      klass.updateName(input.name);
    }

    await this.classRepository.save(klass);

    return new UpdateClassOutput(klass);
  }
}
