FROM node:13.7

RUN mkdir app
WORKDIR app

COPY package.json .
RUN yarn && yarn cache clean

COPY src src
COPY public public

EXPOSE 3000/tcp

ENTRYPOINT ["yarn"]
CMD ["start"]
