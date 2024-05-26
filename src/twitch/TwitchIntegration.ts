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

import { StaticAuthProvider } from '@twurple/auth'

import LoggerService from 'voguhbot/services/LoggerService'
import TwurpleApiClient from 'voguhbot/twitch/twurple/TwurpleApiClient'
import TwurpleChatClient from 'voguhbot/twitch/twurple/TwurpleChatClient'
import { SCOPES } from 'voguhbot/utils/constants'

const logger = LoggerService.getLogger()
export default class TwitchIntegration {
  private readonly _apiClient: TwurpleApiClient
  private readonly _chatClient: TwurpleChatClient

  constructor() {
    const authProvider = new StaticAuthProvider(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_ACCESS_TOKEN, SCOPES)
    this._apiClient = new TwurpleApiClient({ authProvider })
    this._chatClient = new TwurpleChatClient({ authProvider, channels: [] })

    this._chatClient.onRaid((...args) => logger.info(args))
    this._chatClient.onSub((...args) => logger.info(args))
    this._chatClient.onResub((...args) => logger.info(args))
    this._chatClient.onMessage((...args) => logger.info(args))

    this._chatClient.onJoin(function onJoin(broadcasterName, userName) {
      logger.info(`Successfully joined in channel '${broadcasterName}' with user '${userName}'!`)
    })

    this._chatClient.onPart(function onLeave(broadcasterName, userName) {
      logger.info(`Successfully leaved from channel '${broadcasterName}' with user '${userName}'!`)
    })
  }

  public async start(): Promise<void> {
    this._chatClient.connect()
  }
}
