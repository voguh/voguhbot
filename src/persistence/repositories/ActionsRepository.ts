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
import ActionEntity from 'voguhbot/persistence/entities/ActionEntity'
import TypeORMBaseRepository from 'voguhbot/persistence/repositories/TypeORMBaseRepository'
import ActionType from 'voguhbot/utils/ActionType'

export default class ActionsRepository extends TypeORMBaseRepository<string, ActionEntity> {
  constructor(databaseManager: DatabaseManager | EntityManager) {
    super(databaseManager, ActionEntity)
  }

  public listByChannelId(channelId: string): Promise<ActionEntity[]> {
    return this._repository.find({ where: { channelId } })
  }

  public findChannelAction(channelId: string, actionType: ActionType): Promise<ActionEntity> {
    return this._repository.findOneBy({ channelId, actionType })
  }
}
