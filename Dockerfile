FROM node:18 As development
WORKDIR /usr/src/app

COPY .env .env
COPY ./package*.json ./
RUN npm install -g
COPY . .

RUN chown -R node:node .
USER node

EXPOSE 35440

CMD ["npm", "run", "dev"]