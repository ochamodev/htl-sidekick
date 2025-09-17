import { HtlEntry } from "./types/htl-entry";

const attribute = (s: string) => "data-sly-".concat(s);

export const HTL_ATTRS: Record<string, HtlEntry> = {
  [attribute("use")]: {
    title: "data-sly-use",
    doc: "(Sling Model/JS/Java) instance and exposes it as variable.",
    example: `<div data-sly-use.model="com.example.Model">${'${model.title}'}</div>`
  },
  [attribute("list")]: {
    title: "data-sly-list",
    doc: "Iterates over a collection and exposes *item*/*itemList*.",
    example: `<ul data-sly-list="${'${items}'}"><li>${'${item}'}</li></ul>`
  },
  [attribute("repeat")]: {
    title: "data-sly-repeat",
    doc: "Repeats host elements n times (similar to list but by index)."
  },
  [attribute("test")]: {
    title: "data-sly-test",
    doc: "Conditional rendering of an element.",
    example: `<div data-sly-test="${'${condition}'}">Visible si condition</div>`
  },
  [attribute("set")]: {
    title: "data-sly-set",
    doc: "Declares or defines HTL variables.",
    example: `<sly data-sly-set.foo="${'${1+1}'}"/>`
  },
  [attribute("include")]: {
    title: "data-sly-include",
    doc: "Includes an **HTL script** (HTML fragment)."
  },
  [attribute("resource")]: {
    title: "data-sly-resource",
    doc: "Includes an AEM resource (by `resourceType`, path, etc.)."
  },
  [attribute("template")]: {
    title: "data-sly-template",
    doc: "Declares a reusable template that can be invoked by  `data-sly-call`."
  },
  [attribute("call")]: {
    title: "data-sly-call",
    doc: "Invokes a tmeplate declared with `data-sly-template`."
  },
  [attribute("text")]: {
    title: "data-sly-text",
    doc: "Replaces host element's content for a text."
  },
  [attribute("unwrap")]: {
    title: "data-sly-unwrap",
    doc: "Deletes host element and leaves its content given a condition."
  },
  [attribute("element")]: {
    title: "data-sly-element",
    doc: "Changes dinamically **name of element**.",
    example: `<div data-sly-element="${'${isH1 ? \"h1\" : \"p\"}'}">Titulo</div>`
  },
  [attribute("attribute")]: {
    title: "data-sly-attribute",
    doc: "Sets attributes dinamically (one or many) in host element.",
    example: `<a data-sly-attribute.href="${'${url}'}">Link</a>`
  }
};

export const EXPRESSION_HOVER_MD = [
  "HTL **Expression Language**: `${ ... }` evaluates and emits values with  *context-aware escaping* given its position in HTML.",
  "",
  "Examples:",
  "```html",
  "<p>${properties.title}</p>",
  "<a href=\"${link}\">${text}</a>",
  "```",
  "",
  "Options: `@ context='html|text|uri|...'",
].join("\n");