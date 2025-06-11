import { Class } from "../../entities/Class";

export class GetClassOutput {
  constructor(public readonly klass: Class | null) {}
}
