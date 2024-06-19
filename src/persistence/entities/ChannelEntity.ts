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

import * as TypeORM from 'typeorm'

import ActionEntity from 'voguhbot/persistence/entities/ActionEntity'
import CommandEntity from 'voguhbot/persistence/entities/CommandEntity'
import { CHANNELS_TABLE_NAME } from 'voguhbot/persistence/migrations/1718715624776-CreateChannelsTable'

@TypeORM.Entity({ name: CHANNELS_TABLE_NAME })
export default class ChannelEntity {
  @TypeORM.PrimaryGeneratedColumn('uuid', { name: 'id' })
  public readonly id: string

  @TypeORM.Column('varchar', { name: 'twitch_id', length: 255, nullable: false, unique: true })
  public readonly twitchId: string

  @TypeORM.Column('varchar', { name: 'username', length: 32, nullable: false, unique: true })
  public readonly username: string

  @TypeORM.Column('boolean', { name: 'active', nullable: false, default: true })
  public readonly active: boolean

  @TypeORM.CreateDateColumn({ name: 'created_at' })
  public readonly createdAt: Date

  @TypeORM.CreateDateColumn({ name: 'updated_at' })
  public readonly updatedAt: Date

  @TypeORM.OneToMany(() => ActionEntity, (action) => action.channel, { eager: true })
  public readonly actions: ActionEntity[]

  @TypeORM.OneToMany(() => CommandEntity, (action) => action.channel, { eager: true })
  public readonly commands: CommandEntity[]
}
