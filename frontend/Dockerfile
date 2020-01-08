FROM node:13.5

RUN mkdir app
WORKDIR app

COPY package.json .
RUN yarn

COPY src src
COPY public public

EXPOSE 3000/tcp

ENTRYPOINT ["yarn"]
CMD ["start"]
