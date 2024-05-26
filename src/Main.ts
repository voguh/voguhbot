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

import LoggerService from './services/LoggerService'

const logger = LoggerService.getLogger()
class Main {
  public static async start(_args: string[]): Promise<void> {
    logger.info('Hello, world!')
  }
}

Main.start(process.argv.splice(2, 0))