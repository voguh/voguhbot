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

import { DeepPartial, EntityManager, FindManyOptions, FindOptionsWhere, Repository } from 'typeorm'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

import DatabaseManager from 'voguhbot/persistence/DatabaseManager'

export default abstract class TypeORMBaseRepository<Id, Entity extends EntityBase<Id>> {
  protected readonly _entity: Class<Entity>
  protected readonly _repository: Repository<Entity>

  constructor(databaseManagerOrEntityManager: DatabaseManager | EntityManager, entity: Class<Entity>) {
    this._entity = entity

    if (databaseManagerOrEntityManager instanceof DatabaseManager) {
      this._repository = databaseManagerOrEntityManager.getRepository(entity)
    } else if (databaseManagerOrEntityManager instanceof EntityManager) {
      this._repository = databaseManagerOrEntityManager.getRepository(entity)
    } else {
      throw new Error('Missing or invalid property databaseManager or entityManager!')
    }
  }

  public async listAll(options?: FindManyOptions<Entity>): Promise<Entity[]> {
    return this._repository.find(options)
  }

  public async findById(id: Id): Promise<Entity> {
    return this._repository.findOneBy({ id } as FindOptionsWhere<Entity>)
  }

  public async create(data: DeepPartial<Entity>): Promise<Entity> {
    const { id } = await this._repository.save(data)
    return this.findById(id)
  }

  public async update(id: Id, data: QueryDeepPartialEntity<Entity>): Promise<Entity> {
    await this._repository.update({ id } as FindOptionsWhere<Entity>, data)
    return this.findById(id)
  }

  public async delete(id: Id): Promise<void> {
    await this._repository.delete({ id } as FindOptionsWhere<Entity>)
  }
}
