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

import { EntityManager } from 'typeorm'

import DatabaseManager from 'voguhbot/persistence/DatabaseManager'
import CommandEntity from 'voguhbot/persistence/entities/CommandEntity'
import TypeORMBaseRepository from 'voguhbot/persistence/repositories/TypeORMBaseRepository'

export default class CommandsRepository extends TypeORMBaseRepository<string, CommandEntity> {
  constructor(databaseManager: DatabaseManager | EntityManager) {
    super(databaseManager, CommandEntity)
  }

  public listByChannelId(channelId: string): Promise<CommandEntity[]> {
    return this._repository.find({ where: { channelId } })
  }

  public findChannelCommand(channelId: string, command: string): Promise<CommandEntity> {
    return this._repository.findOneBy({ channelId, command })
  }
}
