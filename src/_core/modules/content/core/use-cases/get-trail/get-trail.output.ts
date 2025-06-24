import { Trail } from "../../entities/Trail";

export class GetTrailOutput {
  constructor(public readonly trail: Trail | null) {}
}
