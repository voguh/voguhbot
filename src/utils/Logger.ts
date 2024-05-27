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

import path from 'node:path'

import winston from 'winston'

import { LIB_PATH, LOGS_PATH } from 'voguhbot/utils/constants'

const colorize = winston.format.colorize().colorize
export default class Logger {
  private readonly _logger: winston.Logger

  constructor(category?: string) {
    this._logger = winston.createLogger({
      level: process.env.LOG_LEVEL ?? 'info',
      defaultMeta: { category },
      transports: [
        new winston.transports.Console({
          format: winston.format.printf((info) => {
            info.levelAndCategory = colorize(info.level, `${info.level}/${info.category}`)
            let message = `${info.timestamp} ${info.levelAndCategory} ${info.package} - ${info.message}`
            if (info.stack) {
              message = `${message}\n${info.stack}`
            }

            return message
          })
        }),
        new winston.transports.File({
          filename: path.resolve(LOGS_PATH, `${category}.log`),
          maxsize: 1024 * 1024 * 1,
          zippedArchive: true,
          maxFiles: 14,
          format: winston.format.printf((info) => {
            let message = `${info.timestamp} ${info.level} ${info.package} - ${info.message}`
            if (info.stack) {
              message = `${message}\n${info.stack}`
            }

            return message
          })
        })
      ]
    })
  }

  private _log(level: string, message: any): void {
    const stack = new Error().stack.split('\n')
    const callerRaw = stack[3].trim()
    const callerParts = callerRaw.split(' ')

    let callerMethod = '<anonymous>'
    let callerFilePath = ''
    if (callerParts.length === 3) {
      const [_at, method, filePathRaw] = callerParts
      callerMethod = method.split('.').at(-1) ?? '<anonymous>'
      callerFilePath = filePathRaw.slice(1, -1)
    } else if (callerParts.length === 5) {
      callerFilePath = callerParts.at(-1).slice(1, -1)
    } else {
      const [_at, filePathRaw] = callerParts
      callerFilePath = filePathRaw
    }

    const [filePath, callerRow, _callerColumn] = callerFilePath.split(':')
    const shortFilePath = filePath.replace(`${LIB_PATH}/`, '').replace(/\.(js|ts)/, '')
    const packageName = `net.oscproject.voguhbot.${shortFilePath.replace(/\//g, '.')}`
    const info: winston.Logform.TransformableInfo = {
      level: level,
      message: message,
      timestamp: new Date().toISOString(),
      package: `${packageName}.${callerMethod}:${callerRow}`
    }

    if (info.message instanceof Error) {
      info.message = info.message.message
      info.stack = info.message.stack
    }

    this._logger.log(info)
  }

  public trace(message: any): void {
    this._log('debug', message)
  }

  public debug(message: any): void {
    this._log('debug', message)
  }

  public info(message: any): void {
    this._log('info', message)
  }

  public warn(message: any): void {
    this._log('warn', message)
  }

  public error(message: any): void {
    this._log('error', message)
  }

  public fatal(message: any): void {
    this._log('error', message)
  }
}
