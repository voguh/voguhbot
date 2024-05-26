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

import { ChatMessage } from '@twurple/chat'

import ConfigService from 'voguhbot/services/ConfigService'
import LoggerService from 'voguhbot/services/LoggerService'
import TwurpleApiClient from 'voguhbot/twitch/twurple/TwurpleApiClient'

export interface TwitchBaseEvent {
  /**
   * The ID of the broadcaster.
   */
  broadcasterId: string
  /**
   * The name of the broadcaster.
   */
  broadcasterName: string
  /**
   * The ID of the user who sent the message.
   */
  userId: string
  /**
   * The name of the user who sent the message.
   */
  userName: string
  /**
   * The display name of the user who sent the message.
   */
  userDisplayName: string

  /**
   * Sends an action (/me) to the channel.
   *
   * @param text The text to send.
   */
  action: (text: string) => Promise<void>
  /**
   * Sends a regular chat message to the channel.
   *
   * @param text The text to send.
   */
  say: (text: string) => Promise<void>
}

type ActionsRecord = Record<string, (api: TwurpleApiClient, msg: ChatMessage, ...args: string[]) => Promise<string>>
const _logger = LoggerService.getLogger()
export default abstract class EventHandler<T extends TwitchBaseEvent> {
  protected readonly _configService: ConfigService
  protected readonly _apiClient: TwurpleApiClient

  private readonly _actions: ActionsRecord = {
    channel: async (api, msg, userName) => (userName.startsWith('@') ? userName.substring(1) : userName).toLowerCase(),
    game: async (api, msg, userName) => {
      const normalizedUserName = (userName.startsWith('@') ? userName.substring(1) : userName).toLowerCase()
      const { id } = await api.users.getUserByName(normalizedUserName)
      const { gameName } = await api.channels.getChannelInfoById(id)

      return gameName
    },
    random: async (api, msg, range) => {
      const [min, max] = range.split('-').map(Number)

      if (Number.isNaN(min) || Number.isNaN(max)) {
        return '-1'
      }

      return String(Math.floor(Math.random() * (max - min) + min))
    },
    'random.viwer': async (api, msg) => {
      const viwersObjects = await api.asUser(api.tokenInfo.userId, (ctx) => ctx.chat.getChatters(msg.channelId))
      const viwers = viwersObjects.data.map((u) => u.userName)
      const randomIndex = Math.floor(Math.random() * viwers.length)

      return viwers[randomIndex]
    },
    msgid: async (api, msg) => {
      return msg.id
    },
    sender: async (api, msg) => {
      return msg.userInfo.userName
    }
  }

  constructor(configService: ConfigService, apiClient: TwurpleApiClient) {
    this._configService = configService
    this._apiClient = apiClient
  }

  protected async _replaces(variables: Record<string, string>, msg: ChatMessage, output: string): Promise<string> {
    let normalizedOutput = output

    for (const [key, value] of Object.entries(variables)) {
      normalizedOutput = normalizedOutput.replaceAll(`\${${key}}`, value)
    }

    for (const [action, handler] of Object.entries(this._actions)) {
      const regex = new RegExp(`\\$\\{${action}([ A-Za-z\\d_@]+)\\}`, 'g')
      const matchers = normalizedOutput.match(regex) ?? []
      for (const match of matchers) {
        const [_action, ...args] = match.slice(2, -1).split(' ')
        try {
          const result = await handler(this._apiClient, msg, ...args.map((s) => s.trim()))
          normalizedOutput = normalizedOutput.replaceAll(match, result)
        } catch (e: any) {
          _logger.error(e)
          normalizedOutput = normalizedOutput.replaceAll(match, '*ERROR*')
        }
      }
    }

    return normalizedOutput
  }

  public abstract onEvent(event: T): Promise<void>
}
