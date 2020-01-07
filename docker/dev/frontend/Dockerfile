FROM node:13.5

RUN mkdir app
WORKDIR app

COPY frontend/package.json .
RUN yarn

COPY frontend/src src
COPY frontend/public public

EXPOSE 3000/tcp

ENTRYPOINT ["yarn"]
CMD ["start"]
