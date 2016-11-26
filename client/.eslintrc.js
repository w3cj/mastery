module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  // "extends": ["eslint:recommended"],
  "ecmaFeatures": {
    "modules": true
  },
  "env": {
    "node": true,
    "es6": true,
    "browser": true
  },
  "globals": {},
  "rules": {
    "no-console": 0,
    "comma-dangle": 2,
    "no-unreachable": 2,
    "no-unused-vars": 2,
    "no-var": 2,
    "semi": 2,
    "object-shorthand": 2,
    "prefer-arrow-callback": 2,
    "prefer-const": 2,
    "prefer-spread": 2,
    "prefer-template": 2,
    "require-yield": 2
  },
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
