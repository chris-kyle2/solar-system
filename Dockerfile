FROM node:18-alpine3.17

WORKDIR /usr/app

COPY package*.json /usr/app/

RUN npm install

COPY . .

RUN ls -la /usr/app && ls -la /usr/app/envLoader.js

# Run the environment loader script before starting the app
CMD ["sh", "-c", "node envLoader.js && npm start"]

EXPOSE 3000
