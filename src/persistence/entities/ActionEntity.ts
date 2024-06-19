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

import ChannelEntity from 'voguhbot/persistence/entities/ChannelEntity'
import { ACTIONS_TABLE_NAME } from 'voguhbot/persistence/migrations/1718715630019-CreateActionsTable'
import ActionType from 'voguhbot/utils/ActionType'

@TypeORM.Entity({ name: ACTIONS_TABLE_NAME })
export default class ActionEntity {
  @TypeORM.PrimaryGeneratedColumn('uuid', { name: 'id' })
  public readonly id: string

  @TypeORM.Column('uuid', { name: 'channel_id' })
  public readonly channelId: string

  @TypeORM.Column('boolean', { name: 'active', nullable: false, default: true })
  public readonly active: boolean

  @TypeORM.Column('varchar', { name: 'action_type', length: 32, nullable: false })
  public readonly actionType: ActionType

  @TypeORM.Column('varchar', { name: 'message', length: 255, nullable: false })
  public readonly message: string

  @TypeORM.CreateDateColumn({ name: 'created_at' })
  public readonly createdAt: Date

  @TypeORM.CreateDateColumn({ name: 'updated_at' })
  public readonly updatedAt: Date

  @TypeORM.ManyToOne(() => ChannelEntity, (channel) => channel.actions, { lazy: true })
  @TypeORM.JoinColumn({ name: 'channel_id', referencedColumnName: 'id' })
  public readonly channel: Promise<ChannelEntity>
}
