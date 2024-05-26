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

export interface TwitchRaidEvent extends TwitchBaseEvent {
  /**
   * The number of viewers joining with the raid.
   */
  viewerCount: number
}

export default class RaidEventHandler extends EventHandler<TwitchRaidEvent> {
  public async onEvent(event: TwitchRaidEvent): Promise<void> {
    const { broadcasterName, say, userDisplayName, userName, viewerCount } = event
    const channelData = this._configService.getChannelConfig(broadcasterName)
    if (channelData == null || channelData.raid == null) {
      return
    }

    if (viewerCount <= 1) {
      return
    }

    const replaces = { userDisplayName, userName }
    const message = await this._replaces(replaces, null, channelData.raid.message)

    await say(message)
    if (channelData.raid.autoShoutout) {
      await say(`/shoutout ${userName}`)
    }
  }
}
