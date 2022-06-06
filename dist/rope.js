"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rope = exports.SubstrNode = exports.ConcatNode = exports.AtomNode = exports.NodeBase = void 0;
class NodeBase {
    constructor(length) {
        this.length = length;
    }
    toString(range) {
        if (range) {
            let bad = false;
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
        const parts = [];
        this.gather(parts, range);
        return parts.join("");
    }
}
exports.NodeBase = NodeBase;
class AtomNode extends NodeBase {
    constructor(value) {
        super(value.length);
        this.value = value;
    }
    gather(parts, range) {
        if (range) {
            parts.push(this.value.slice(range.begin, range.end));
        }
        else {
            parts.push(this.value);
        }
    }
}
exports.AtomNode = AtomNode;
function sumLengths(xs) {
    let n = 0;
    for (const x of xs) {
        n += x.length;
    }
    return n;
}
class ConcatNode extends NodeBase {
    constructor(...kids) {
        super(sumLengths(kids));
        this.kids = kids;
    }
    gather(parts, range) {
        if (range) {
            const r = Object.assign({}, range);
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
        }
        else {
            for (const kid of this.kids) {
                kid.gather(parts);
            }
        }
    }
}
exports.ConcatNode = ConcatNode;
class SubstrNode extends NodeBase {
    constructor(kid, range) {
        super(range.end - range.begin);
        this.kid = kid;
        this.range = range;
    }
    gather(parts, range) {
        if (range) {
            const r = { begin: this.range.begin + range.begin, end: this.range.begin + range.end };
            this.kid.gather(parts, r);
        }
        else {
            this.kid.gather(parts, this.range);
        }
    }
}
exports.SubstrNode = SubstrNode;
class Rope {
    constructor(root) {
        this.length = root.length;
        this.root = root;
    }
    toString(range) {
        return this.root.toString(range);
    }
    static atom(value) {
        return new Rope(new AtomNode(value));
    }
    static concat(...kids) {
        const xs = [];
        for (const kid of kids) {
            xs.push(kid.root);
        }
        return new Rope(new ConcatNode(...xs));
    }
    static substr(kid, begin, end) {
        if (end == undefined) {
            end = kid.length;
        }
        return new Rope(new SubstrNode(kid.root, { begin, end }));
    }
}
exports.Rope = Rope;
