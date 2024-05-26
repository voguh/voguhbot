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

import { ChatClient, ChatClientOptions } from '@twurple/chat'

import LoggerService from 'voguhbot/services/LoggerService'

const _logger = LoggerService.getLogger('twurple')
export default class TwurpleChatClient extends ChatClient {
  constructor(config: Omit<ChatClientOptions, 'logger'>) {
    super({
      ...config,
      logger: {
        custom(level, message) {
          switch (level) {
            case 7: // TRACE
              return _logger.trace(message)
            case 4: // DEBUG
              return _logger.debug(message)
            case 3: // INFO
              return _logger.info(message)
            case 2: // WARNING
              return _logger.warn(message)
            case 1: // ERROR
              return _logger.error(message)
            case 0: // CRITICAL
              return _logger.fatal(message)
          }
        }
      }
    })
  }
}
