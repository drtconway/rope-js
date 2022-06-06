export interface Range {
    begin: number;
    end: number;
}
export declare abstract class NodeBase {
    readonly length: number;
    constructor(length: number);
    toString(range?: Range): string;
    abstract gather(parts: string[], range?: Range): void;
}
export declare class AtomNode extends NodeBase {
    readonly value: string;
    constructor(value: string);
    gather(parts: string[], range?: Range): void;
}
export declare class ConcatNode extends NodeBase {
    readonly kids: NodeBase[];
    constructor(...kids: NodeBase[]);
    gather(parts: string[], range?: Range): void;
}
export declare class SubstrNode extends NodeBase {
    readonly kid: NodeBase;
    readonly range: Range;
    constructor(kid: NodeBase, range: Range);
    gather(parts: string[], range?: Range): void;
}
export declare class Rope {
    readonly length: number;
    readonly root: NodeBase;
    private constructor();
    toString(range?: Range): string;
    static atom(value: string): Rope;
    static concat(...kids: Rope[]): Rope;
    static substr(kid: Rope, begin: number, end?: number): Rope;
}
