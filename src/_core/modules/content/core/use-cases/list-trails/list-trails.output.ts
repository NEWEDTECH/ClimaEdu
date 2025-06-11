import { Trail } from "../../entities/Trail";

export class ListTrailsOutput {
  constructor(public readonly trails: Trail[]) {}
}
