FROM node:16.3

RUN mkdir app
WORKDIR app

COPY package.json .
RUN yarn && yarn cache clean

COPY src src
COPY public public

EXPOSE 3000/tcp

ENTRYPOINT ["yarn"]
CMD ["start"]
