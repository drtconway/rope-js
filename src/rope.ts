export interface Range {
  begin: number;
  end: number;
}

export abstract class NodeBase {
  readonly length: number;

  constructor(length: number) {
    this.length = length;
  }

  toString(range?: Range): string {
    if (range) {
      let bad: boolean = false;
      if (!Number.isInteger(range.begin) || range.begin < 0 || range.begin > range.end) {
        bad = true;
      }
      if (!Number.isInteger(range.end) || range.end < range.begin || range.end > this.length) {
        bad = true;
      }
      if (bad) {
        throw new Error(`range [${range.begin}, ${range.end}) is invalid.`);
      }
    }
    const parts: string[] = [];
    this.gather(parts, range);
    return parts.join("");
  }

  abstract gather(parts: string[], range?: Range): void;
}

export class AtomNode extends NodeBase {
  readonly value: string;

  constructor(value: string) {
    super(value.length);
    this.value = value;
  }

  gather(parts: string[], range?: Range): void {
    if (range) {
      parts.push(this.value.slice(range.begin, range.end));
    } else {
      parts.push(this.value);
    }
  }
}

function sumLengths(xs: { readonly length: number }[]): number {
  let n = 0;
  for (const x of xs) {
    n += x.length;
  }
  return n;
}

export class ConcatNode extends NodeBase {
  readonly kids: NodeBase[];

  constructor(...kids: NodeBase[]) {
    super(sumLengths(kids));
    this.kids = kids;
  }

  gather(parts: string[], range?: Range): void {
    if (range) {
      const r: Range = { ...range };
      for (const kid of this.kids) {
        const l = kid.length;
        if (r.begin >= l) {
          r.begin -= l;
          r.end -= l;
          continue;
        }
        if (r.end <= l) {
          kid.gather(parts, r);
          break;
        }
        kid.gather(parts, { begin: r.begin, end: l });
        r.begin = 0;
        r.end -= l;
      }
    } else {
      for (const kid of this.kids) {
        kid.gather(parts);
      }
    }
  }
}

export class SubstrNode extends NodeBase {
  readonly kid: NodeBase;
  readonly range: Range;

  constructor(kid: NodeBase, range: Range) {
    super(range.end - range.begin);
    this.kid = kid;
    this.range = range;
  }

  gather(parts: string[], range?: Range) {
    if (range) {
      const r: Range = { begin: this.range.begin + range.begin, end: this.range.begin + range.end };
      this.kid.gather(parts, r);
    } else {
      this.kid.gather(parts, this.range);
    }
  }
}

export class Rope {
  readonly length: number;
  readonly root: NodeBase;

  private constructor(root: NodeBase) {
    this.length = root.length;
    this.root = root;
  }

  toString(range?: Range): string {
    return this.root.toString(range);
  }

  static atom(value: string): Rope {
    return new Rope(new AtomNode(value));
  }

  static concat(...kids: Rope[]): Rope {
    const xs: NodeBase[] = [];
    for (const kid of kids) {
      xs.push(kid.root);
    }
    return new Rope(new ConcatNode(...xs));
  }

  static substr(kid: Rope, begin: number, end?: number): Rope {
    if (end == undefined) {
      end = kid.length;
    }
    return new Rope(new SubstrNode(kid.root, { begin, end }));
  }
}
