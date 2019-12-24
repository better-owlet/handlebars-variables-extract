import extract, { track } from "../src"

/**
 * Dummy test
 */
describe("extract", () => {
  const emit = jest.fn();
  it("should allow you to extract simple references", () => {
    track(`{{foo.bar}}`, emit);
    expect(emit).toBeCalledWith(['foo', 'bar'], false);
  });

  it("should support 'each'", () => {
    track(`{{#each foo}}{{bar}}{{/each}}`, emit);
    expect(emit).toBeCalledWith(['foo', '#', 'bar'], false);
  });

  it("should support 'each' without getting hung up on @index", () => {
    track(`{{#each foo}}{{@index}}{{/each}}`, emit);
    expect(emit).not.toBeCalledWith(['foo', '#', 'index'], false);
  });

  it("should support 'with'", () => {
    track('{{#with foo}}{{bar}}{{/with}}', emit);
    return expect(emit).toBeCalledWith(['foo', 'bar'], false);
  });
  it("should support '@root'", () => {
    track('{{#each foo.bar}}{{@root.bar}}{{/each}}', emit);
    return expect(emit).toBeCalledWith(['bar'], false);
  });
  it("should support '../'", () => {
    track('{{#with foo}}{{#each bar}}{{../baz}}{{/each}}{{/with}}', emit);
    return expect(emit).toBeCalledWith(['foo', 'baz'], false);
  });
  it('should be able to deal with simple extensions', () => {
    track('{{alt foo.bar foo.baz}}', emit);
    expect(emit).toBeCalledWith(['foo', 'bar'], false);
    return expect(emit).toBeCalledWith(['foo', 'baz'], false);
  });
  it("should support generating a schema", () => {
    expect(extract).toBeDefined();
    expect(typeof extract).toBe('function');
    const template = "{{#each foo}}\n  {{bar}}\n  {{@root.baz}}\n  {{../baz}}\n{{/each}}";
    const schema = extract(template);
    expect(schema).toEqual({
      "type": "object",
      "properties": {
        "foo": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "bar": {
                "type": "any"
              }
            }
          }
        },
        "baz": {
          "type": "any"
        }
      }
    });
    expect(schema.properties).toHaveProperty('foo');
    expect(schema.properties.foo).toHaveProperty('type', 'array');
    expect(schema.properties).toHaveProperty('baz');
    expect(schema.properties.baz).toHaveProperty('type', 'any');
    expect(schema.properties.foo).toHaveProperty('items');
    expect(schema.properties.foo.items.properties).toHaveProperty('bar');
    expect(schema.properties.foo.items.properties.bar).toHaveProperty('type', 'any');
  });
  it('should handle simple helpers correctly', () => {
    track('{{currency amount}}', emit);
    return expect(emit).toBeCalledWith(['amount'], false);
  });
  it('should deal with ifs in a meaningful way', () => {
    track('{{#if foo}}{{foo.bar}}{{/if}}', emit);
    expect(emit).toBeCalledWith(['foo'], true);
    return expect(emit).toBeCalledWith(['foo', 'bar'], true);
  });
  it('should deal with optionals correctly while generating a schema', () => {
    const template = "{{foo.baz}}\n{{#if foo}}\n{{@root.go}}\n{{foo.bar.yoyo}}\n{{/if}}";
    const schema = extract(template);
    expect(schema).toEqual({
      "type": "object",
      "properties": {
        "foo": {
          "type": "object",
          "properties": {
            "baz": {
              "type": "any"
            },
            "bar": {
              "type": "object",
              "properties": {
                "yoyo": {
                  "type": "any"
                }
              }
            }
          }
        },
        "go": {
          "type": "any"
        }
      }
    });
  });
  it('should allow you to add definitions for other directives', () => {
    const template = "{{alt foo.bar foo.baz}}";
    track(template, emit, {
      alt: {
        optional: true
      }
    });
    return expect(emit).toBeCalledWith(['foo', 'bar'], true);
  });
  it('should consider all parts of a ternary operator to be optional', () => {
    const template = "{{ternary foo.bar foo.baz foo.gum}}";
    const schema = extract(template, {
      ternary: {
        optional: true
      }
    });
    console.log(schema)
  });
  it('should ignore variables starting with @', () => {
    const template = "{{@foo.bar}}";
    const schema = extract(template);
    console.log('22', schema)
    expect(schema).not.toHaveProperty('foo');
  });
  return it('should not consider something with length property to be an object', () => {
    const template = "{{foo.length}}";
    const schema = extract(template);
    expect(schema.properties).toHaveProperty('foo');
    return expect(schema.properties.foo).toHaveProperty('type', 'any');
  });
})
