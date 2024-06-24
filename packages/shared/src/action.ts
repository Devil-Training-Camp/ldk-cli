export interface ActionTargetConfig {
  version: string;
  local: string;
  name: string;
  title: string;
}
export class Action<T extends ActionTargetConfig> {
  constructor(private targetArr: T[]) {}
  get(name: string) {
    return this.targetArr.find(target => target.name === name);
  }
  add(target: T) {
    if (this.has(target.name)) return false;
    this.targetArr.push(target);
    return true;
  }
  remove(name: string) {
    const curIdx = this.targetArr.findIndex(target => target.name === name);
    if (curIdx !== -1) {
      this.targetArr.splice(curIdx, 1);
      return true;
    }
    return false;
  }
  has(name: string) {
    return this.targetArr.findIndex(target => target.name === name) !== -1;
  }
  removeAll() {
    this.targetArr.length = 0;
  }
}
