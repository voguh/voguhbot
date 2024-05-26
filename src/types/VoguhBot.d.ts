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

declare interface VoguhBotConfig {
  channels: Record<string, VoguhBotChannel>
}

declare interface VoguhBotChannel {
  sub?: VoguhBotSub
  raid?: VoguhBotRaid
  commands?: VoguhBotCommand[]
}

declare interface VoguhBotSub {
  message: string
}

declare interface VoguhBotRaid {
  autoShoutout: boolean
  message: string
}

declare interface VoguhBotCommand {
  command: string
  globalCooldown?: number
  userCooldown?: number
  aliases: string[]
  output: string
  userType: import('voguhbot/utils/UserType').default
  reply?: boolean
}

declare interface VoguhBotClipCommand extends VoguhBotCommand {
  specialCommand: 'CHATBOT_CLIP'
  discord?: {
    webhook?: string
    message: string
  }
}
