/*! *****************************************************************************
Copyright 2024 Voguh

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
***************************************************************************** */

const fs = require('node:fs')
const path = require('node:path')

const tsConfigPath = path.resolve(__dirname, 'tsconfig.json')
const jsonRaw = fs.readFileSync(tsConfigPath, 'utf-8').replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '')
const { compilerOptions } = JSON.parse(jsonRaw)

const alias = Object.entries(compilerOptions.paths)
  .map(([key, values]) => [key.replace('/*', ''), values[0].replace('/*', '')])
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})

module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }], ['@babel/preset-typescript']],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['module-resolver', { cwd: path.resolve(__dirname), alias }]
  ],
  ignore: ['**/*.d.ts']
}
