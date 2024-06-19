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
import axios from 'axios'

import CommandEntity from 'voguhbot/persistence/entities/CommandEntity'
import CooldownService from 'voguhbot/services/CooldownManager'
import LoggerService from 'voguhbot/services/LoggerService'
import EventHandler, { TwitchBaseEvent } from 'voguhbot/twitch/events/EventHandler'
import CooldownType from 'voguhbot/utils/CooldownType'
import SpecialCommand, { CommandClipSpecialEntity } from 'voguhbot/utils/SpecialCommand'
import UserLevel from 'voguhbot/utils/UserLevel'

export interface TwitchChatEvent extends TwitchBaseEvent {
  /**
   * Identify user's type in chat.
   */
  userType: UserLevel
  /**
   * Raw message text
   */
  text: string
  /**
   * Message object class
   */
  message: ChatMessage
  /**
   * Sends a reply to the chat message to the channel.
   * @param text The text to send.
   */
  reply: (text: string) => Promise<void>
}

const _logger = LoggerService.getLogger()
export default class ChatEventHandler extends EventHandler<TwitchChatEvent> {
  public async onEvent(event: TwitchChatEvent): Promise<void> {
    const { broadcasterName, text } = event
    const channelData = this._configService.getChannelConfig(broadcasterName)
    if (channelData == null) {
      return
    }

    const [cmd, ...params] = (text ?? '').trim().split(' ')
    if (!cmd.startsWith('!')) {
      return
    }

    const commandData = (channelData.commands ?? []).find(({ command, aliases }) => [command, ...aliases].includes(cmd))
    if (commandData == null) {
      return
    }

    return this._onChatCommand(commandData, params ?? [], event)
  }

  // eslint-disable-next-line prettier/prettier
  private _canExecuteCommand(commandKey: string, userName: string, userLevel: UserLevel, minimumUserLevel: UserLevel, cooldownType: CooldownType): boolean {
    if (userLevel < minimumUserLevel) {
      _logger.debug(`[${commandKey}] Command called by ${userName} unauthorized!`)

      return false
    } else if (cooldownType === CooldownType.USER && CooldownService.isOnCooldown(commandKey, userName)) {
      _logger.debug(`[${commandKey}] Command called by ${userName} awaiting for user cooldown!`)

      return false
    } else if (CooldownService.isOnCooldown(commandKey)) {
      _logger.debug(`[${commandKey}] Command called by ${userName} awaiting for global cooldown!`)

      return false
    }

    return true
  }

  private async _onChatCommand(data: CommandEntity, params: string[], event: TwitchChatEvent): Promise<void> {
    const { message, userLevel: expectedUserLevel, cooldown, cooldownType, asReply } = data
    const { broadcasterName, reply, say, userDisplayName, userName, userType } = event
    const commandKey = `${event.broadcasterName}::${data.command}`

    _logger.info(`[${commandKey}] Command called by ${event.userName}!`)
    try {
      if (!this._canExecuteCommand(commandKey, userName, userType, expectedUserLevel, cooldownType)) {
        return
      }

      const variableReplaces: Record<string, string> = {
        ...params.reduce((acc, value, i) => ({ ...acc, [`${i + 1}`]: value }), {}),
        touser: params[0],
        broadcasterName: broadcasterName,
        userName: userName,
        userDisplayName: userDisplayName
      }

      let normalizedOutput = await this._replaces(variableReplaces, event.message, message)
      if (SpecialCommand.clipGuard(data)) {
        normalizedOutput = await this._onClipCommand(data, normalizedOutput, event)
      }

      if (asReply) {
        await reply(normalizedOutput)
      } else {
        await say(normalizedOutput)
      }

      _logger.debug(`[${commandKey}] Command called by ${event.userName} successfully!`)
    } catch (e: any) {
      _logger.error(`[${commandKey}] Command called by ${event.userName} failed!`)
      _logger.error(e)
    } finally {
      if (cooldownType === CooldownType.USER) {
        CooldownService.startCooldown(commandKey, userName, cooldown)
      } else {
        CooldownService.startCooldown(commandKey, null, cooldown)
      }
    }
  }

  private async _onClipCommand(data: CommandClipSpecialEntity, msg: string, event: TwitchChatEvent): Promise<string> {
    const { broadcasterName, userDisplayName, userName } = event
    try {
      const tokenInfo = this._apiClient.tokenInfo ?? (await this._apiClient.getTokenInfo())
      const channel = event.broadcasterId
      const clipId = await this._apiClient.asUser(tokenInfo.userId, (ctx) => ctx.clips.createClip({ channel }))
      const clipUrl = `https://clips.twitch.tv/${clipId}`

      const specialConfig = data.specialCommandConfig
      if (specialConfig != null) {
        const discordData = specialConfig.discord
        if (specialConfig.discord != null) {
          try {
            const clipData = await this._apiClient.clips.getClipById(clipId)

            const variableReplaces = {
              broadcasterName: broadcasterName,
              userName: userName,
              userDisplayName: userDisplayName,
              clipUrl: clipUrl
            }
            const normalizedContent = this._replaces(variableReplaces, null, discordData.message)

            const webhookData = {
              username: 'VoguhBot',
              avatar_url: 'https://github.com/voguh/voguhbot/blob/main/docs/icon.png?raw=true',
              content: normalizedContent,
              embeds: [
                {
                  title: `${clipData.broadcasterDisplayName} - ${clipData.title}`,
                  description: `Watch ${clipData.broadcasterDisplayName}'s clip titled "${clipData.title}"`,
                  author: { name: 'Twitch' },
                  url: clipData.url,
                  thumbnail: { url: clipData.thumbnailUrl }
                }
              ]
            }

            await axios.post(discordData.webhook, webhookData)
          } catch (e: any) {
            _logger.warn(`An error occurred on emit clip to discord:`)
            _logger.warn(e)
          }
        }
      }

      return msg.replaceAll(`\${clipUrl}`, clipUrl)
    } catch (e: any) {
      _logger.error(e)
    }
  }
}
