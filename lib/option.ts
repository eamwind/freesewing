import { PatternOption } from './types'
export class Option {
  id: string;
  config: PatternOption;
  val: number;

  constructor(config: PatternOption) {
    this.id = config.id;
    this.config = config;
    this.val = config.val;

    return this;
  }
}
