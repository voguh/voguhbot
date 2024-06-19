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
import ChannelEntity from 'voguhbot/persistence/entities/ChannelEntity'
import TypeORMBaseRepository from 'voguhbot/persistence/repositories/TypeORMBaseRepository'

export default class ChannelsRepository extends TypeORMBaseRepository<string, ChannelEntity> {
  constructor(databaseManagerOrEntityManager: DatabaseManager | EntityManager) {
    super(databaseManagerOrEntityManager, ChannelEntity)
  }
}
