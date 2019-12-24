# Extract variables from handlebars

<!-- [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Greenkeeper badge](https://badges.greenkeeper.io/alexjoverm/typescript-library-starter.svg)](https://greenkeeper.io/)
[![Travis](https://img.shields.io/travis/alexjoverm/typescript-library-starter.svg)](https://travis-ci.org/alexjoverm/typescript-library-starter)
[![Coveralls](https://img.shields.io/coveralls/alexjoverm/typescript-library-starter.svg)](https://coveralls.io/github/alexjoverm/typescript-library-starter)
[![Dev Dependencies](https://david-dm.org/alexjoverm/typescript-library-starter/dev-status.svg)](https://david-dm.org/alexjoverm/typescript-library-starter?type=dev)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg)](https://paypal.me/AJoverMorales) -->

### Usage

```bash
npm install handlebars-variables-extract
```

```javascript
import extract from 'handlebars-variables-extract';
extract(`{{template}}`);
```

[CDN](https://unpkg.com/handlebars-variables-extract)

`<script src="https://unpkg.com/handlebars-variables-extract@1.0.0/dist/handlebars-variables-extract.umd.js"></script>`

input

```html
<p>{{firstname}} {{lastname}}</p>
```

output like JSON schema https://json-schema.org/

```json
{
  "type": "object",
  "properties": {
    "firstname": {
      "type": "any"
    },
    "lastname": {
      "type": "any"
    }
  }
}
```

[DEMO](https://a-owl.github.com/handlebars-variables-extract)

## Contributing

### NPM scripts

 - `npm t`: Run test suite
 - `npm start`: Run `npm run build` in watch mode
 - `npm run test:watch`: Run test suite in [interactive watch mode](http://facebook.github.io/jest/docs/cli.html#watch)
 - `npm run test:prod`: Run linting and generate coverage
 - `npm run build`: Generate bundles and typings, create docs
 - `npm run lint`: Lints code
 - `npm run commit`: Commit using conventional commit style ([husky](https://github.com/typicode/husky) will tell you to use it if you haven't :wink:)

### Excluding peerDependencies

On library development, one might want to set some peer dependencies, and thus remove those from the final bundle. You can see in [Rollup docs](https://rollupjs.org/#peer-dependencies) how to do that.

Good news: the setup is here for you, you must only include the dependency name in `external` property within `rollup.config.js`. For example, if you want to exclude `lodash`, just write there `external: ['lodash']`.

This project refer to [barhandles](https://github.com/wspringer/barhandles).

Contributions of any kind are welcome!
