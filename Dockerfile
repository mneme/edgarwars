FROM node:12.11.1-alpine

ADD ./ /app 
WORKDIR /app

RUN yarn && yarn build

EXPOSE 80

CMD node index
