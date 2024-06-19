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

import DatabaseManager from 'voguhbot/persistence/DatabaseManager'
import ActionEntity from 'voguhbot/persistence/entities/ActionEntity'
import ChannelEntity from 'voguhbot/persistence/entities/ChannelEntity'
import CommandEntity from 'voguhbot/persistence/entities/CommandEntity'
import ActionsRepository from 'voguhbot/persistence/repositories/ActionsRepository'
import ChannelsRepository from 'voguhbot/persistence/repositories/ChannelsRepository'
import CommandsRepository from 'voguhbot/persistence/repositories/CommandsRepository'
import LoggerService from 'voguhbot/services/LoggerService'

type ActionCreateDTO = Omit<ActionEntity, 'id' | 'channelId' | 'createdAt' | 'updatedAt' | 'channel'>
type CommandCreateDTO = Omit<CommandEntity, 'id' | 'channelId' | 'createdAt' | 'updatedAt' | 'channel'>
export interface ChannelCreateDTO
  extends Omit<ChannelEntity, 'id' | 'createdAt' | 'updatedAt' | 'actions' | 'commands'> {
  actions: ActionCreateDTO[]
  commands: CommandCreateDTO[]
}

export interface ChannelConfig extends Omit<ChannelEntity, 'actions'> {
  actions: Map<string, ActionEntity>
}

const logger = LoggerService.getLogger()
export default class ConfigService {
  private readonly _databaseManager: DatabaseManager
  private readonly _repository: ChannelsRepository
  private readonly _listeners: ((config: Map<string, ChannelConfig>) => void)[]

  private _config: Map<string, ChannelConfig>

  constructor(databaseManager: DatabaseManager) {
    this._databaseManager = databaseManager
    this._repository = new ChannelsRepository(databaseManager)
    this._listeners = []
  }

  public async start(): Promise<void> {
    const channels = await this._repository.listAll()
    this._config = this._parseChannelsList(channels)
  }

  public async stop(): Promise<void> {
    this._config.clear()
    this._listeners.splice(0, this._listeners.length)
  }

  public getChannelConfig(broadcasterName: string): ChannelConfig {
    return this._config.get(broadcasterName)
  }

  public addListener(listener: (config: Map<string, ChannelConfig>) => void): void {
    this._listeners.push(listener)
    listener(this._config)
  }

  public removeListener(listener: (config: Map<string, ChannelConfig>) => void): void {
    const indexOf = this._listeners.indexOf(listener)
    if (indexOf !== -1) {
      this._listeners.splice(indexOf, 1)
    }
  }

  public async registerChannel(data: ChannelCreateDTO): Promise<ChannelEntity> {
    logger.info('Registering channel data...')
    const channelData = await this._databaseManager.withTransaction(async (entityManager) => {
      const channelsRepository = new ChannelsRepository(entityManager)
      const actionsRepository = new ActionsRepository(entityManager)
      const commandsRepository = new CommandsRepository(entityManager)

      const { id: channelId } = await channelsRepository.create(data)

      await Promise.all(data.actions.map((action) => actionsRepository.create({ ...action, channelId })))
      await Promise.all(data.commands.map((command) => commandsRepository.create({ ...command, channelId })))

      return channelsRepository.findById(channelId)
    })
    logger.info('Channel data successfully registered!')

    this._emit()

    return channelData
  }

  private async _emit(): Promise<void> {
    logger.debug('Emitting channels data...')

    const channels = await this._repository.listAll()
    this._config = this._parseChannelsList(channels)

    for (const listener of this._listeners) {
      listener(this._config)
    }

    logger.debug('Channels data emitted for all listeners!')
  }

  private _parseChannelsList(channels: ChannelEntity[]): Map<string, ChannelConfig> {
    const config = new Map<string, ChannelConfig>()

    for (const channel of channels) {
      const actions = new Map(channel.actions.map((action) => [action.actionType, action]))
      config.set(channel.username, { ...channel, actions })
    }

    return config
  }
}
