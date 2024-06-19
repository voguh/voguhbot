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

import EventHandler, { TwitchBaseEvent } from 'voguhbot/twitch/events/EventHandler'
import ActionType from 'voguhbot/utils/ActionType'

export interface TwitchSubEvent extends TwitchBaseEvent {
  /**
   * The plan ID of the subscription.
   *
   * Tier 1, 2, 3 are '1000', '2000', '3000' respectively, and a Twitch Prime subscription is called 'Prime'.
   */
  level: '1000' | '2000' | '3000' | 'prime'
  /**
   * The number of total months of subscriptions for the channel.
   */
  months: number
  /**
   * The number of consecutive months of subscriptions for the channel.
   *
   * Will not be sent if the user resubscribing does not choose to.
   */
  streak: number
  /**
   * The message that was sent with the subscription.
   */
  message?: string
}

export default class SubscribeEventHandler extends EventHandler<TwitchSubEvent> {
  public async onEvent(event: TwitchSubEvent): Promise<void> {
    const { broadcasterName, say, userDisplayName, userName } = event

    const channelData = this._configService.getChannelConfig(broadcasterName)
    const subAction = channelData?.actions[ActionType.ON_SUB]
    if (subAction == null) {
      return
    }

    const replaces = { userDisplayName, userName }
    const message = await this._replaces(replaces, null, subAction.message)

    await say(message)
  }
}
