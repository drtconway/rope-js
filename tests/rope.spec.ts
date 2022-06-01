import { AtomNode, ConcatNode, Rope, SubstrNode } from "../src/rope";

import * as mocha from "mocha";
import * as chai from "chai";

const expect = chai.expect;

describe("atom nodes", () => {
  it("simple atom", () => {
    const atom = new AtomNode("foo");
    expect(atom.toString()).to.eql("foo");
  });
  it("atom ranges", () => {
    const atom = new AtomNode("foo bar baz");
    expect(atom.toString({ begin: 0, end: 3 })).to.eql("foo");
    expect(atom.toString({ begin: 4, end: 7 })).to.eql("bar");
    expect(() => atom.toString({ begin: -2, end: -1 })).to.throw(Error, "range [-2, -1) is invalid.");
    expect(() => atom.toString({ begin: 2, end: 1 })).to.throw(Error, "range [2, 1) is invalid.");
    expect(() => atom.toString({ begin: 1.1, end: 2.2 })).to.throw(Error, "range [1.1, 2.2) is invalid.");
  });
});

describe("concat nodes", () => {
  it("degenerate case", () => {
    const cat = new ConcatNode(new AtomNode("bazqux"));
    expect(cat.toString()).to.eql("bazqux");
    expect(cat.toString({ begin: 3, end: 6 })).to.eql("qux");
  });
  it("compound case", () => {
    const cat = new ConcatNode(new AtomNode("foo"), new AtomNode("bar"), new AtomNode("baz"), new AtomNode("qux"));
    expect(cat.toString()).to.eql("foobarbazqux");
    expect(cat.toString({ begin: 3, end: 6 })).to.eql("bar");
    expect(cat.toString({ begin: 2, end: 10 })).to.eql("obarbazq");
  });
});

describe("substr nodes", () => {
  it("simple case", () => {
    const sub = new SubstrNode(new AtomNode("foobarbazqux"), { begin: 2, end: 10 });
    expect(sub.toString()).to.eql("obarbazq");
    expect(sub.toString({ begin: 1, end: 7 })).to.eql("barbaz");
  });
});

describe("ropes", () => {
  it("atom", () => {
    expect(Rope.atom("foo").toString()).to.eql("foo");
  });
  it("concat", () => {
    const a = Rope.atom("bar");
    const b = Rope.atom("baz");
    expect(Rope.concat(a, b).toString()).to.eql("barbaz");
  });
  it("substr", () => {
    const a = Rope.atom("barbazqux");
    expect(Rope.substr(a, 3).toString()).to.eql("bazqux");
    expect(Rope.substr(a, 3, 6).toString()).to.eql("baz");
  });
});
