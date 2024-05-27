# Copyright 2024 Voguh
# 
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
# 
#     http://www.apache.org/licenses/LICENSE-2.0
# 
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM node:18.20.0 as builder

WORKDIR /voguhbot

COPY . .

RUN corepack enable pnpm && pnpm install && pnpm build

FROM node:18.20.0-alpine

WORKDIR /voguhbot

COPY --from=builder /voguhbot/dist /voguhbot/lib
COPY --from=builder /voguhbot/package.json /voguhbot/package.json

RUN yarn install --production && mkdir /voguhbot/data /voguhbot/logs

VOLUME [ "/voguhbot/config", "/voguhbot/logs" ]

CMD ["node", "/voguhbot/lib/Main.js"]