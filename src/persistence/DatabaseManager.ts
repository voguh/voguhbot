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

import path from 'node:path'

import { DataSource, DataSourceOptions, EntityManager, Logger, Repository } from 'typeorm'

import LoggerService from 'voguhbot/services/LoggerService'
import { ROOT_PATH } from 'voguhbot/utils/constants'

const _logger = LoggerService.getLogger()
export default class DatabaseManager {
  private readonly _dataSource: DataSource

  constructor() {
    const baseOptions = this._buildDriverOptions()
    const dataSourceLogger = this._dataSourceLogger()

    this._dataSource = new DataSource({
      ...baseOptions,
      entities: [path.resolve(__dirname, 'entities', '*')],
      migrations: [path.resolve(__dirname, 'migrations', '*')],
      logger: dataSourceLogger
    })
  }

  private _buildDriverOptions(): DataSourceOptions {
    const { DATABASE_DRIVER, DATABASE_URL } = process.env

    switch (DATABASE_DRIVER) {
      case 'mysql':
      case 'mariadb':
      case 'postgres':
        _logger.info(`Using database driver '${DATABASE_DRIVER}' with connection url '${DATABASE_URL}'.`)
        return { type: DATABASE_DRIVER, url: DATABASE_URL }
      case 'better-sqlite3':
      case 'sqlite':
        _logger.info(`Using database driver 'better-sqlite3' with connection url '${DATABASE_URL}'.`)
        return { type: 'better-sqlite3', database: (DATABASE_URL ?? '').replace('<ROOT_PATH>', ROOT_PATH) }
      default:
        throw new Error('Invalid database driver, allowed drivers are: mysql, mariadb, postgres or sqlite')
    }
  }

  private _dataSourceLogger(): Logger {
    const dataSourceLogger = LoggerService.getLogger('typeorm')

    return {
      logQuery(query, parameters) {
        if (parameters) {
          dataSourceLogger.debug(`Running query '${query}' with parameters [${parameters.join(', ')}]`)
        } else {
          dataSourceLogger.debug(`Running query '${query}'`)
        }
      },
      logQueryError(error, query, parameters) {
        if (parameters) {
          dataSourceLogger.debug(`Query '${query}' with parameters [${parameters.join(', ')}]`)
        } else {
          dataSourceLogger.debug(`Query '${query}'`)
        }

        if (typeof error === 'string') {
          dataSourceLogger.error(`Query error: ${error}`)
        } else {
          dataSourceLogger.error(error)
        }
      },
      logQuerySlow(time, query, parameters) {
        dataSourceLogger.warn('Query too slow!')
        if (parameters) {
          dataSourceLogger.debug(`Query '${query}' with parameters [${parameters.join(', ')}]`)
        } else {
          dataSourceLogger.debug(`Query '${query}'`)
        }
      },
      logSchemaBuild(message) {
        dataSourceLogger.debug(`Schema build: ${message}`)
      },
      logMigration(message) {
        dataSourceLogger.debug(`Migration: ${message}`)
      },
      log(level, message) {
        if (level === 'info' || level === 'warn') {
          dataSourceLogger[level](message)
        } else {
          dataSourceLogger.debug(message)
        }
      }
    }
  }

  public async withTransaction<T = void>(consumer: (entityManager: EntityManager) => Promise<T>): Promise<T> {
    return await this._dataSource.transaction(consumer)
  }

  public getRepository<Id, T extends EntityBase<Id>>(target: Class<T>): Repository<T> {
    return this._dataSource.getRepository(target)
  }

  public async start(): Promise<void> {
    await this._dataSource.initialize()

    const hasMigrationsToRun = await this._dataSource.showMigrations()
    if (hasMigrationsToRun) {
      await this._dataSource.runMigrations({ transaction: 'all' })
    }
  }

  public async stop(): Promise<void> {
    await this._dataSource.destroy()
  }
}
