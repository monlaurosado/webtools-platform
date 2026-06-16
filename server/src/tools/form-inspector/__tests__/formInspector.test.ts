import { describe, expect, it } from "vitest";
import {
  ERROR_MESSAGES,
  MAX_HTML_BYTES,
  analyzeForms,
} from "../service";

const warningCodes = (html: string, formIndex = 0) =>
  analyzeForms(html).forms[formIndex]?.warnings.map((warning) => warning.code) ?? [];

describe("analyzeForms", () => {
  it("returns an empty array when there are no forms", () => {
    const result = analyzeForms("<main><p>No forms here</p></main>");

    expect(result).toEqual({ forms: [] });
  });

  it("detects a basic form with action and method", () => {
    const result = analyzeForms(
      '<form action="/lead" method="post"><button type="submit">Send</button></form>',
    );

    expect(result.forms).toHaveLength(1);
    expect(result.forms[0]).toMatchObject({
      index: 0,
      action: "/lead",
      method: "post",
      warnings: [],
    });
  });

  it("extracts inputs with name, type, placeholder and required", () => {
    const result = analyzeForms(
      '<form action="/lead" method="post">' +
        '<input type="email" name="email" placeholder="Email" required>' +
        '<button>Send</button>' +
        "</form>",
    );

    expect(result.forms[0].fields[0]).toMatchObject({
      tag: "input",
      type: "email",
      name: "email",
      placeholder: "Email",
      required: true,
      disabled: false,
      readonly: false,
      options: [],
    });
    expect(result.forms[0].summary).toMatchObject({
      totalFields: 2,
      inputs: 1,
      buttons: 1,
      requiredFields: 1,
    });
  });

  it('uses type "text" for inputs without type', () => {
    const result = analyzeForms(
      '<form action="/lead" method="post"><input name="firstName"><button></button></form>',
    );

    expect(result.forms[0].fields[0].type).toBe("text");
  });

  it("extracts hidden fields", () => {
    const result = analyzeForms(
      '<form action="/lead" method="post">' +
        '<input type="hidden" name="source" value="adwords">' +
        '<button></button>' +
        "</form>",
    );

    expect(result.forms[0].fields[0]).toMatchObject({
      tag: "input",
      type: "hidden",
      name: "source",
      value: "adwords",
    });
    expect(result.forms[0].summary.hiddenFields).toBe(1);
  });

  it("extracts selects with options", () => {
    const result = analyzeForms(
      '<form action="/lead" method="post">' +
        '<select name="plan">' +
        '<option value="basic">Basic</option>' +
        '<option selected disabled>Pro</option>' +
        "</select>" +
        '<button></button>' +
        "</form>",
    );

    expect(result.forms[0].fields[0]).toMatchObject({
      tag: "select",
      name: "plan",
      options: [
        { value: "basic", label: "Basic", selected: false, disabled: false },
        { value: null, label: "Pro", selected: true, disabled: true },
      ],
    });
    expect(result.forms[0].summary.selects).toBe(1);
  });

  it("extracts textareas", () => {
    const result = analyzeForms(
      '<form action="/contact" method="post">' +
        '<textarea name="message" placeholder="Message">Hello</textarea>' +
        '<button></button>' +
        "</form>",
    );

    expect(result.forms[0].fields[0]).toMatchObject({
      tag: "textarea",
      type: null,
      name: "message",
      value: "Hello",
      placeholder: "Message",
    });
    expect(result.forms[0].summary.textareas).toBe(1);
  });

  it("extracts buttons", () => {
    const result = analyzeForms(
      '<form action="/lead" method="post"><button name="send" value="1">Send</button></form>',
    );

    expect(result.forms[0].fields[0]).toMatchObject({
      tag: "button",
      type: "submit",
      name: "send",
      value: "1",
    });
    expect(result.forms[0].summary.buttons).toBe(1);
    expect(result.forms[0].warnings).toEqual([]);
  });

  it("detects labels by label for attribute", () => {
    const result = analyzeForms(
      '<form action="/lead" method="post">' +
        '<label for="email">Email address</label>' +
        '<input id="email" name="email">' +
        '<button></button>' +
        "</form>",
    );

    expect(result.forms[0].fields[0].label).toBe("Email address");
  });

  it("detects wrapping labels", () => {
    const result = analyzeForms(
      '<form action="/lead" method="post">' +
        '<label>Full name <input name="name"></label>' +
        '<button></button>' +
        "</form>",
    );

    expect(result.forms[0].fields[0].label).toBe("Full name");
  });

  it("detects missing action warnings", () => {
    expect(
      warningCodes('<form method="post"><input name="email"><button></button></form>'),
    ).toContain("missing_action");
  });

  it("detects empty action warnings", () => {
    expect(
      warningCodes(
        '<form action="   " method="post"><input name="email"><button></button></form>',
      ),
    ).toContain("empty_action");
  });

  it("detects hash action warnings", () => {
    expect(
      warningCodes(
        '<form action="#" method="post"><input name="email"><button></button></form>',
      ),
    ).toContain("hash_action");
  });

  it("detects missing method warnings", () => {
    expect(
      warningCodes('<form action="/lead"><input name="email"><button></button></form>'),
    ).toContain("missing_method");
  });

  it("detects invalid method warnings", () => {
    expect(
      warningCodes(
        '<form action="/lead" method="dialog"><input name="email"><button></button></form>',
      ),
    ).toContain("invalid_method");
  });

  it("detects input fields without name", () => {
    const result = analyzeForms(
      '<form action="/lead" method="post"><input><button></button></form>',
    );

    expect(result.forms[0].warnings).toContainEqual({
      code: "input_missing_name",
      message: "Field does not define a name attribute.",
      fieldIndex: 0,
    });
  });

  it("detects hidden fields without name", () => {
    const result = analyzeForms(
      '<form action="/lead" method="post"><input type="hidden"><button></button></form>',
    );

    expect(result.forms[0].warnings.map((warning) => warning.code)).toEqual(
      expect.arrayContaining(["input_missing_name", "hidden_missing_name"]),
    );
  });

  it("detects required fields without name", () => {
    const result = analyzeForms(
      '<form action="/lead" method="post"><input required><button></button></form>',
    );

    expect(result.forms[0].warnings.map((warning) => warning.code)).toEqual(
      expect.arrayContaining(["input_missing_name", "required_missing_name"]),
    );
  });

  it("detects missing submit button warnings", () => {
    expect(
      warningCodes('<form action="/lead" method="post"><input name="email"></form>'),
    ).toContain("missing_submit_button");
  });

  it("detects duplicate forms by action and method", () => {
    const result = analyzeForms(
      '<form action="/lead" method="POST"><button></button></form>' +
        '<form action="/lead" method="post"><button></button></form>' +
        '<form action="/other" method="post"><button></button></form>',
    );

    expect(result.forms[0].warnings.map((warning) => warning.code)).toContain(
      "duplicate_action_method",
    );
    expect(result.forms[1].warnings.map((warning) => warning.code)).toContain(
      "duplicate_action_method",
    );
    expect(result.forms[2].warnings.map((warning) => warning.code)).not.toContain(
      "duplicate_action_method",
    );
  });

  it("keeps form order", () => {
    const result = analyzeForms(
      '<form action="/first" method="post"><button></button></form>' +
        '<form action="/second" method="get"><button></button></form>',
    );

    expect(result.forms.map((form) => form.action)).toEqual(["/first", "/second"]);
    expect(result.forms.map((form) => form.index)).toEqual([0, 1]);
  });

  it("keeps field order", () => {
    const result = analyzeForms(
      '<form action="/lead" method="post">' +
        '<input name="first">' +
        '<select name="second"></select>' +
        '<textarea name="third"></textarea>' +
        '<button name="fourth"></button>' +
        "</form>",
    );

    expect(result.forms[0].fields.map((field) => field.name)).toEqual([
      "first",
      "second",
      "third",
      "fourth",
    ]);
  });

  it("rejects non-string html", () => {
    expect(() => analyzeForms(123)).toThrow(ERROR_MESSAGES.invalidHtml);
  });

  it("rejects HTML larger than 1 MB", () => {
    const oversizedHtml = "x".repeat(MAX_HTML_BYTES + 1);

    expect(() => analyzeForms(oversizedHtml)).toThrow(ERROR_MESSAGES.htmlTooLarge);
  });
});
