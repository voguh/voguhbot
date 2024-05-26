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

import Strings from 'voguhbot/utils/Strings'

interface CooldownItem {
  global: number
  byUser: Record<string, number>
}

export default class CooldownService {
  private static readonly _cooldownMap = new Map<string, CooldownItem>()

  public static startCooldown(key: string, userName: string, delay: number): void {
    if (this.isOnCooldown(key, userName)) {
      return
    }

    if (!this._cooldownMap.has(key)) {
      this._cooldownMap.set(key, { global: 0, byUser: {} })
    }

    const cooldownItem = this._cooldownMap.get(key)
    if (!Strings.isNullOrEmpty(userName)) {
      cooldownItem.byUser[userName] = delay
    } else {
      cooldownItem.global = delay
    }

    this._cooldownMap.set(key, cooldownItem)
    const interval = setInterval(() => {
      const cooldownItem = this._cooldownMap.get(key)

      if (!Strings.isNullOrEmpty(userName)) {
        cooldownItem.byUser[userName]--
      } else {
        cooldownItem.global--
      }

      this._cooldownMap.set(key, cooldownItem)

      if (!Strings.isNullOrEmpty(userName)) {
        if (cooldownItem.byUser[userName] <= 0) {
          clearInterval(interval)
        }
      } else if (cooldownItem.global <= 0) {
        clearInterval(interval)
      }
    }, 1000)
  }

  public static isOnCooldown(key: string, userName?: string): boolean {
    const cooldownItem = this._cooldownMap.get(key)
    if (cooldownItem != null) {
      if (!Strings.isNullOrEmpty(userName)) {
        const userCooldown = cooldownItem.byUser[userName]
        if (userCooldown != null) {
          return userCooldown > 0
        }
      } else {
        return cooldownItem.global > 0
      }
    }

    return false
  }
}
