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

import Logger from 'voguhbot/utils/Logger'
import Strings from 'voguhbot/utils/Strings'

export default class LoggerService {
  private static _defaultLogger = new Logger('voguhbot')
  private static _customLoggersMap = new Map<string, Logger>()

  public static getLogger(category?: string): Logger {
    if (!Strings.isNullOrEmpty(category) && category !== 'default' && category !== 'voguhbot') {
      let _logger = this._customLoggersMap.get(category)
      if (_logger == null) {
        _logger = new Logger(category)
        this._customLoggersMap.set(category, _logger)
      }

      return _logger
    }

    return this._defaultLogger
  }
}
