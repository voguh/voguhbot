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
import { ChatMessage, ChatRaidInfo, ChatSubInfo, ChatUser, UserNotice } from '@twurple/chat'

import ConfigService, { ChannelConfig } from 'voguhbot/services/ConfigService'
import LoggerService from 'voguhbot/services/LoggerService'
import ChatEventHandler, { TwitchChatEvent } from 'voguhbot/twitch/events/ChatEventHandler'
import RaidEventHandler, { TwitchRaidEvent } from 'voguhbot/twitch/events/RaidEventHandler'
import SubscribeEventHandler, { TwitchSubEvent } from 'voguhbot/twitch/events/SubscribeEventHandler'
import TwurpleApiClient from 'voguhbot/twitch/twurple/TwurpleApiClient'
import TwurpleChatClient from 'voguhbot/twitch/twurple/TwurpleChatClient'
import { SCOPES } from 'voguhbot/utils/constants'
import UserLevel from 'voguhbot/utils/UserLevel'

const logger = LoggerService.getLogger()
export default class TwitchIntegration {
  private readonly _joinedChannels = []
  private readonly _configService: ConfigService

  private readonly _apiClient: TwurpleApiClient
  private readonly _chatClient: TwurpleChatClient

  private readonly _raidEventHandler: RaidEventHandler
  private readonly _subscribeEventHandler: SubscribeEventHandler
  private readonly _chatEventHandler: ChatEventHandler

  constructor(configService: ConfigService) {
    this._configService = configService

    const authProvider = new StaticAuthProvider(process.env.TWITCH_CLIENT_ID, process.env.TWITCH_ACCESS_TOKEN, SCOPES)
    this._apiClient = new TwurpleApiClient({ authProvider })
    this._chatClient = new TwurpleChatClient({ authProvider, channels: [] })

    this._raidEventHandler = new RaidEventHandler(this._configService, this._apiClient)
    this._subscribeEventHandler = new SubscribeEventHandler(this._configService, this._apiClient)
    this._chatEventHandler = new ChatEventHandler(this._configService, this._apiClient)

    this._chatClient.onRaid((...args) => this._onRaid(...args))
    this._chatClient.onSub((...args) => this._onSubscribe(...args))
    this._chatClient.onResub((...args) => this._onSubscribe(...args))
    this._chatClient.onMessage((...args) => this._onMessage(...args))

    this._chatClient.onJoin(function onJoin(broadcasterName, userName) {
      logger.info(`Successfully joined in channel '${broadcasterName}' with user '${userName}'!`)
    })

    this._chatClient.onPart(function onLeave(broadcasterName, userName) {
      logger.info(`Successfully leaved from channel '${broadcasterName}' with user '${userName}'!`)
    })
  }

  public async start(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this._chatClient.onConnect(resolve)
      this._chatClient.onDisconnect((manually, reason) => {
        if (reason) {
          reject(reason)
        }
      })
      this._chatClient.connect()
    })

    this._configService.addListener((config) => this._onConfigUpdate(config))
  }

  public async stop(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this._chatClient.onDisconnect((manually, reason) => (reason ? reject(reason) : resolve()))
      this._chatClient.quit()
    })
  }

  private _onConfigUpdate(config: Map<string, ChannelConfig>): void {
    const joinedChannelsThatNeedToLeave = [...this._joinedChannels]
    for (const channelName of config.keys()) {
      if (joinedChannelsThatNeedToLeave.includes(channelName)) {
        const indexOf = joinedChannelsThatNeedToLeave.indexOf(channelName)
        joinedChannelsThatNeedToLeave.splice(indexOf, 1)
      } else {
        this._chatJoin(channelName)
      }
    }

    for (const channelName of joinedChannelsThatNeedToLeave) {
      this._chatLeave(channelName)
    }
  }

  private _chatJoin(channelName: string): void {
    logger.debug(`VoguhBot is joining '${channelName}'...`)
    const indexOf = this._joinedChannels.indexOf(channelName)
    if (this._chatClient != null && indexOf === -1) {
      this._chatClient.join(channelName)
      this._joinedChannels.push(channelName)
    }
  }

  private _chatLeave(channelName: string): void {
    logger.debug(`VoguhBot is leaving '${channelName}'...`)
    const indexOf = this._joinedChannels.indexOf(channelName)
    if (this._chatClient != null && indexOf >= 0) {
      this._chatClient.part(channelName)
      this._joinedChannels.splice(indexOf, 1)
    }
  }

  // #region << ON RAID >>
  private _onRaid(channel: string, user: string, raidInfo: ChatRaidInfo, msg: UserNotice): void {
    const userInfo = msg.userInfo
    const event: TwitchRaidEvent = {
      broadcasterId: msg.channelId,
      broadcasterName: channel,
      userId: userInfo.userId,
      userName: user,
      userDisplayName: userInfo.displayName,

      viewerCount: raidInfo.viewerCount,

      action: (text) => this._chatClient.action(channel, text),
      say: (text: string) => this._chatClient.say(channel, text)
    }

    this._raidEventHandler.onEvent(event)
  }
  // #endregion

  // #region << ON SUBSCRIBE >>
  private _onSubscribe(channel: string, user: string, subInfo: ChatSubInfo, msg: UserNotice): void {
    const userInfo = msg.userInfo
    const event: TwitchSubEvent = {
      broadcasterId: msg.channelId,
      broadcasterName: channel,
      userId: userInfo.userId,
      userName: user,
      userDisplayName: userInfo.displayName,

      level: subInfo.plan.toLowerCase() as '1000' | '2000' | '3000' | 'prime',
      months: subInfo.months,
      streak: subInfo.streak,
      message: subInfo.message,

      action: (text) => this._chatClient.action(channel, text),
      say: (text: string) => this._chatClient.say(channel, text)
    }

    this._subscribeEventHandler.onEvent(event)
  }
  // #endregion

  // #region << ON CHAT MESSAGE >>
  private _getUserType(userInfo: ChatUser): UserLevel {
    if (userInfo.isBroadcaster) {
      return UserLevel.BROADCASTER
    } else if (userInfo.isMod) {
      return UserLevel.MODERATOR
    } else if (userInfo.isVip) {
      return UserLevel.VIP
    } else if (userInfo.isSubscriber) {
      return UserLevel.SUB
    } else {
      return UserLevel.VIEWER
    }
  }

  private _onMessage(channel: string, user: string, text: string, msg: ChatMessage): void {
    const userInfo = msg.userInfo
    const event: TwitchChatEvent = {
      broadcasterId: msg.channelId,
      broadcasterName: channel,
      userId: userInfo.userId,
      userName: user,
      userDisplayName: userInfo.displayName,

      userType: this._getUserType(userInfo),
      text: text,
      message: msg,

      action: (text) => this._chatClient.action(channel, text),
      reply: (text: string) => this._chatClient.say(channel, text, { replyTo: msg }),
      say: (text: string) => this._chatClient.say(channel, text)
    }

    this._chatEventHandler.onEvent(event)
  }
  // #endregion
}
