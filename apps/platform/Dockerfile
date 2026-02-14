FROM node:latest

WORKDIR /app

RUN npm install -g pnpm

# 1. Copy file konfigurasi workspace
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
# 2. Copy SEMUA package.json (termasuk milik @jahitin/ui)
COPY apps/platform/package.json ./apps/platform/
COPY packages/ui/package.json ./packages/ui/

RUN pnpm install

COPY . .

WORKDIR /app/apps/platform
RUN pnpm build

EXPOSE 3000

CMD [ "pnpm", "preview", "--port", "3000", "--host" ]
