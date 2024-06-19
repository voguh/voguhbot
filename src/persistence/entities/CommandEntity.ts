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
import { COMMANDS_TABLE_NAME } from 'voguhbot/persistence/migrations/1718715635248-CreateCommandsTable'
import CooldownType from 'voguhbot/utils/CooldownType'
import UserLevel from 'voguhbot/utils/UserLevel'

@TypeORM.Entity({ name: COMMANDS_TABLE_NAME })
export default class CommandEntity<Config extends Record<string, any> = Record<string, any>> {
  @TypeORM.PrimaryGeneratedColumn('uuid', { name: 'id' })
  public readonly id: string

  @TypeORM.Column('uuid', { name: 'channel_id' })
  public readonly channelId: string

  @TypeORM.Column('boolean', { name: 'active', nullable: false, default: true })
  public readonly active: boolean

  @TypeORM.Column('varchar', { name: 'command', length: 16, nullable: false })
  public readonly command: string

  @TypeORM.Column('simple-array', { name: 'aliases', nullable: false })
  public readonly aliases: string[]

  @TypeORM.Column('int2', { name: 'cooldown', nullable: false, default: 30 })
  public readonly cooldown: number

  @TypeORM.Column('varchar', { name: 'cooldown_type', length: 8, nullable: false, default: CooldownType.GLOBAL })
  public readonly cooldownType: CooldownType

  @TypeORM.Column('varchar', { name: 'user_level', length: 8, nullable: false, default: UserLevel.VIEWER })
  public readonly userLevel: UserLevel

  @TypeORM.Column('varchar', { name: 'message', length: 255, nullable: false })
  public readonly message: string

  @TypeORM.Column('boolean', { name: 'as_reply', nullable: false, default: true })
  public readonly asReply: boolean

  @TypeORM.Column('varchar', { name: 'special_command', length: 32, nullable: true })
  public readonly specialCommand?: string

  @TypeORM.Column('json', { name: 'special_command_config', nullable: true })
  public readonly specialCommandConfig?: Config

  @TypeORM.CreateDateColumn({ name: 'created_at' })
  public readonly createdAt: Date

  @TypeORM.CreateDateColumn({ name: 'updated_at' })
  public readonly updatedAt: Date

  @TypeORM.ManyToOne(() => ChannelEntity, (user) => user.commands, { lazy: true })
  @TypeORM.JoinColumn({ name: 'channel_id', referencedColumnName: 'id' })
  public readonly channel: Promise<ChannelEntity>
}
