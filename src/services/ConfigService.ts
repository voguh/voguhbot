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

import fs from 'node:fs'
import path from 'node:path'

import yaml from 'yaml'

import LoggerService from 'voguhbot/services/LoggerService'
import { CONFIG_PATH } from 'voguhbot/utils/constants'
import UserType from 'voguhbot/utils/UserType'

const logger = LoggerService.getLogger()
export default class ConfigService {
  private readonly CONFIG_FILE_PATH = path.resolve(CONFIG_PATH, 'voguhbot.yaml')
  private readonly _listeners: ((config: VoguhBotConfig) => void)[] = []

  private _config: VoguhBotConfig

  public get config(): VoguhBotConfig {
    return this._config
  }

  constructor() {
    if (!fs.existsSync(this.CONFIG_FILE_PATH)) {
      logger.fatal(`Unable to find config file under '${this.CONFIG_FILE_PATH}'!`)
      process.exit(1)
    }

    logger.debug(`Config file '${this.CONFIG_FILE_PATH}' exists!`)
    fs.watchFile(this.CONFIG_FILE_PATH, () => this._configUpdate(this.CONFIG_FILE_PATH))
    this._configUpdate(this.CONFIG_FILE_PATH)
  }

  public getChannelConfig(broadcasterName: string): VoguhBotChannel {
    return this._config?.channels?.[broadcasterName]
  }

  public addListener(listener: (config: VoguhBotConfig) => void): void {
    this._listeners.push(listener)
    listener(this._config)
  }

  public removeListener(listener: (config: VoguhBotConfig) => void): void {
    const indexOf = this._listeners.indexOf(listener)
    if (indexOf !== -1) {
      this._listeners.splice(indexOf, 1)
    }
  }

  private _parseCommandUserType(s: string | number): UserType {
    switch (typeof s === 'string' ? s.toUpperCase() : s) {
      case 4:
      case 'BROADCASTER':
        return UserType.BROADCASTER
      case 3:
      case 'MODERATOR':
        return UserType.MODERATOR
      case 2:
      case 'VIP':
        return UserType.VIP
      case 1:
      case 'SUB':
        return UserType.SUB
      default:
        return UserType.VIEWER
    }
  }

  private _configUpdate(configPath: string): void {
    const configRaw = yaml.parse(fs.readFileSync(configPath, 'utf-8')) as VoguhBotConfig

    for (const [channelName, channelData] of Object.entries(configRaw.channels)) {
      for (let i = 0; i < channelData.commands.length; i++) {
        const commandData = channelData.commands[i]
        configRaw.channels[channelName].commands[i].userType = this._parseCommandUserType(commandData.userType)
      }
    }

    this._config = configRaw
    this._emit(this._config)
    logger.debug('Config updated!')
  }

  private _emit(config: VoguhBotConfig): void {
    for (const listener of this._listeners) {
      listener(config)
    }
  }
}
