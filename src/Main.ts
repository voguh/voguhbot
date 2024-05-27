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

import crypto from 'node:crypto'

import ConfigService from 'voguhbot/services/ConfigService'
import LoggerService from 'voguhbot/services/LoggerService'
import TwitchIntegration from 'voguhbot/twitch/TwitchIntegration'
import { SCOPES } from 'voguhbot/utils/constants'
import Strings from 'voguhbot/utils/Strings'

const logger = LoggerService.getLogger()
class Main {
  public static async start(_args: string[]): Promise<void> {
    logger.debug('Checking required environment variables...')
    if (this._checkEnvironmentVariables()) {
      process.exit(1)
    }

    const configService = new ConfigService()

    const twitchIntegration = new TwitchIntegration(configService)
    await twitchIntegration.start()

    process.on('SIGTERM', async () => {
      await twitchIntegration.stop()
      await configService.stop()
    })
  }

  private static _checkEnvironmentVariables(): boolean {
    const variables = ['TWITCH_CLIENT_ID', 'TWITCH_ACCESS_TOKEN']
    let missingRequiredVars = false

    for (const varName of variables) {
      const envVar = process.env[varName]
      if (!Strings.isNullOrEmpty(envVar)) {
        continue
      }

      logger.fatal(`Missing environment variable: ${varName}`)
      missingRequiredVars = true
    }

    if (missingRequiredVars && Strings.isNullOrEmpty(process.env.TWITCH_ACCESS_TOKEN)) {
      const qs = new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID,
        redirect_uri: 'https://oscproject.net/twitch/oauth/authorized',
        response_type: 'token',
        scope: SCOPES.join(' '),
        state: crypto.randomBytes(16).toString('hex')
      })
      logger.warn(`If 'TWITCH_ACCESS_TOKEN' is missing, use the url below to authorize an user:`)
      logger.warn(`https://id.twitch.tv/oauth2/authorize?${qs.toString()}`)
    }

    return missingRequiredVars
  }
}

Main.start(process.argv.splice(2, 0))
