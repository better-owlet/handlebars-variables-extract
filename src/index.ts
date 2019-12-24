import Handlebars from 'handlebars';

// declare namespace hbs {
//   export namespace AST {
//       interface Node {
//           type: string;
//           loc: SourceLocation;
//       }

//       interface SourceLocation {
//           source: string;
//           start: Position;
//           end: Position;
//       }

//       interface Position {
//           line: number;
//           column: number;
//       }

//       interface Program extends Node {
//           body: Statement[];
//           blockParams: string[];
//       }

//       interface Statement extends Node {}

//       interface MustacheStatement extends Statement {
//           type: 'MustacheStatement';
//           path: PathExpression | Literal;
//           params: Expression[];
//           hash: Hash;
//           escaped: boolean;
//           strip: StripFlags;
//       }

//       interface Decorator extends MustacheStatement { }

//       interface BlockStatement extends Statement {
//           type: 'BlockStatement';
//           path: PathExpression;
//           params: Expression[];
//           hash: Hash;
//           program: Program;
//           inverse: Program;
//           openStrip: StripFlags;
//           inverseStrip: StripFlags;
//           closeStrip: StripFlags;
//       }

//       interface DecoratorBlock extends BlockStatement { }

//       interface PartialStatement extends Statement {
//           type: 'PartialStatement';
//           name: PathExpression | SubExpression;
//           params: Expression[];
//           hash: Hash;
//           indent: string;
//           strip: StripFlags;
//       }

//       interface PartialBlockStatement extends Statement {
//           type: 'PartialBlockStatement';
//           name: PathExpression | SubExpression;
//           params: Expression[];
//           hash: Hash;
//           program: Program;
//           openStrip: StripFlags;
//           closeStrip: StripFlags;
//       }

//       interface ContentStatement extends Statement {
//           type: 'ContentStatement';
//           value: string;
//           original: StripFlags;
//       }

//       interface CommentStatement extends Statement {
//           type: 'CommentStatement';
//           value: string;
//           strip: StripFlags;
//       }

//       interface Expression extends Node {}

//       interface SubExpression extends Expression {
//           type: 'SubExpression';
//           path: PathExpression;
//           params: Expression[];
//           hash: Hash;
//       }

//       interface PathExpression extends Expression {
//           type: 'PathExpression';
//           data: boolean;
//           depth: number;
//           parts: string[];
//           original: string;
//       }

//       interface Literal extends Expression {}
//       interface StringLiteral extends Literal {
//           type: 'StringLiteral';
//           value: string;
//           original: string;
//       }

//       interface BooleanLiteral extends Literal {
//           type: 'BooleanLiteral';
//           value: boolean;
//           original: boolean;
//       }

//       interface NumberLiteral extends Literal {
//           type: 'NumberLiteral';
//           value: number;
//           original: number;
//       }

//       interface UndefinedLiteral extends Literal {
//           type: 'UndefinedLiteral';
// 	  }

//       interface NullLiteral extends Literal {
//           type: 'NullLiteral';
// 	  }

//       interface Hash extends Node {
//           type: 'Hash';
//           pairs: HashPair[];
//       }

//       interface HashPair extends Node {
//           type: 'HashPair';
//           key: string;
//           value: Expression;
//       }

//       interface StripFlags {
//           open: boolean;
//           close: boolean;
//       }
//   }
// }

type IPath = string[];

// Notifies the client of references found.
type IEmit = (path: IPath, optional?: boolean) => void;
export interface IParseOptions {
  srcName?: string;
  ignoreStandalone?: boolean;
}

// like JSON schema https://json-schema.org/
interface ISchema {
  type?: 'string' | 'array' | 'object' | 'any';
  properties?: ISchema;
  items?: ISchema;
  optional?: boolean,
  [key: string]: any;
}

interface IAST {
  type: string;
  // body?: IAST[];
  [key: string]: any;
}

interface IHelper {
  contextParam?: number;
  optional?: boolean;
  transmogrify?: (path: IPath) => IPath;
}

interface IHelpers {
  [key: string]: IHelper;
}

export function track(template: string, emit: IEmit, helperOptions: IHelpers = {}, options: IParseOptions = {}) {
  /**
   * The data structure of the parsed handlebars template.
   */
  const ast = Handlebars.parse(template, options);
  // console.log('AST', ast);

  /**
   * The definition of how to handle different types of directives.
   *
   * For each directive that requires special treatment, it has a key (the name of the directive).
   *
   * The contextParam indicates which parameter of the directive defines the context for any further
   * references. For the `each` directive, it is the first parameter, so the value of `contextParam`
   * is `0`:
   *
   * <pre><code>
   * {{#each foo.bar}} {{baz}} {{/each}}
   * </pre></code>
   *
   * The `transmogrify` function is taking the paths found in the directive and adjusting them
   * in whatever way you deem appropriate.
   *
   * The `optional` parameter indicates wether any further deeper references should be considered
   * optional or not.
   */
  const helpers: IHelpers = {
    each: {
      contextParam: 0,
      transmogrify: (path: IPath) => {
        const clone = path.slice(0);
        clone.push('#');
        return clone;
      },
    },
    if: {
      optional: true
    },
    with: {
      contextParam: 0
    },
    ...helperOptions,
  };

  /**
   * Extends the given path with a new subpath.
   *
   * @param  {Array} path     A path.
   * @param  {Object} subpath A subpath produce by the Handlebars parser.
   * @return {Array}          A new path, the original path with the subpath appended in a way
   *                          that makes sense.
   */
  const extend = (path: IPath = [], subpath: IAST): IPath => {
    if ((subpath.original != null) && subpath.original.startsWith('@root')) {
      return subpath.parts.slice(1);
    } else if ((subpath.original != null) && subpath.original.startsWith('@')) {
      return [];
    } else if ((subpath.original != null) && subpath.original.startsWith('../')) {
      const clone = path[path.length - 1] === '#' ? path.slice(0, -2) : path.slice(0, -1);
      clone.push(...subpath.parts);
      return clone;
    } else {
      return path.concat(subpath.parts)
    }
  };

  function visit(e: IEmit, path: IPath, node: IAST, optional: boolean = false) {
    // console.log('NODE', node);
    switch (node.type) {
      case 'Program': {
        node.body.forEach((child: IAST) => {
          visit(e, path, child, optional);
        });
        break;
      }
      case 'BlockStatement': {
        let newPath = path;
        const helper = helpers[node.path.original] || {};
        // console.log('helper', helper)
        node.params.forEach((child: IAST) => {
          visit(e, path, child, optional || !!helper.optional);
        });
        if (helper.contextParam != null) {
          // debugger;
          const replace = (p: IPath) => {
            return newPath = p;
          };
          // console.log(replace, path, node.params[helper.contextParam]);
          visit(replace, path, node.params[helper.contextParam]);
          if (helper.transmogrify) {
            newPath = helper.transmogrify(newPath);
          }
        }
        // console.log('newPath', newPath);
        visit(e, newPath, node.program, optional || !!helper.optional);
        break;
      }
      case 'PathExpression': {
        // console.log('extend(path, node)', extend(path, node))
        e(extend(path, node), optional);
        break;
      }
      case 'MustacheStatement': {
        const helper = helpers[node.path.original] || {};
        // console.log('MustacheStatement', node);
        if (!node.params || !node.params.length) {
          visit(e, path, node.path, optional);
        } else {
          // TODO test
          node.params.forEach((child: IAST) => {
            visit(e, path, child, optional || !!helper.optional);
          });
        }
        break;
      }
      default: {
        // console.log('IGNORE NODE', node);
        break;
      }
    }
  }

  return visit(emit, [], ast);
}


export default function extract(template: string, helpers: IHelpers = {}, options: IParseOptions = {}): ISchema {
  const schema = {};
  const emit = (path: IPath) => {
    // console.log('EMIT::', path, optional);
    const augment = (o: ISchema, p: IPath): ISchema => {
      // debugger;
      let segment: string;
      // o.optional = o.hasOwnProperty('optional') ? optional && o.optional : optional;
      if (!(!p || !p.length || (p.length === 1 && p[0] === 'length'))) {
        o.type = 'object';
        segment = p[0];
        if (segment === '#') {
          // debugger;
          o.type = 'array';
          o.items = o.items || {};
          return augment(o.items, p.slice(1));
        } else {
          o.properties = o.properties || {};
          o.properties[segment] = o.properties[segment] || {};
          return augment(o.properties[segment], p.slice(1));
        }
      } else {
        o.type = 'any';
        return o;
      }
    };
    return augment(schema, path);
  };
  track(template, emit, helpers, options);
  // delete schema.optional;
  return schema;
}
