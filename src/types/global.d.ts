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

declare namespace NodeJS {
  interface ProcessEnv {
    readonly LOG_LEVEL: string

    readonly DATABASE_DRIVER: 'mysql' | 'mariadb' | 'postgres' | 'sqlite' | 'better-sqlite3'
    readonly DATABASE_URL: string

    readonly TWITCH_CLIENT_ID: string
    readonly TWITCH_CLIENT_SECRET: string
    readonly TWITCH_AUTH_USER_CODE: string
  }
}

declare type Class<T, Args = never> = new (...args: Args) => T
