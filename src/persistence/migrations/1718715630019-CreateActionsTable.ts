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

import { MigrationInterface, QueryRunner, Table } from 'typeorm'

import { CHANNELS_TABLE_NAME } from 'voguhbot/persistence/migrations/1718715624776-CreateChannelsTable'

const TABLE_NAME = 'actions'

export { TABLE_NAME as ACTIONS_TABLE_NAME }
export class CreateActionsTable1718715630019 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = new Table({
      name: TABLE_NAME,
      columns: [
        {
          name: 'id',
          type: 'uuid',
          isPrimary: true
        },

        {
          name: 'channel_id',
          type: 'uuid'
        },
        {
          name: 'active',
          type: 'boolean',
          isNullable: false
        },
        {
          name: 'action_type',
          type: 'varchar',
          length: '32',
          isNullable: false
        },
        {
          name: 'message',
          type: 'varchar',
          length: '255',
          isNullable: false
        },

        {
          name: 'created_at',
          type: 'timestamp',
          isNullable: false
        },
        {
          name: 'updated_at',
          type: 'timestamp',
          isNullable: false
        }
      ],
      foreignKeys: [
        {
          columnNames: ['channel_id'],
          referencedTableName: CHANNELS_TABLE_NAME,
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }
      ]
    })

    await queryRunner.createTable(table)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(TABLE_NAME)
  }
}
