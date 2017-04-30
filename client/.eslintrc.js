module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  "extends": ["eslint:recommended"],
  "ecmaFeatures": {
    "modules": true
  },
  "env": {
    "node": true,
    "es6": true,
    "browser": true
  },
  "globals": {
    d3: true,
    $: true,
    Materialize: true
  },
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    "no-console": 1
  }
}
