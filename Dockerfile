# Use NODEJS
FROM node:16

# Setup image
WORKDIR /usr/src/gw
COPY package*.json ./
COPY . ./
RUN npm install
EXPOSE 9000
CMD [ "npm", "run", "start" ]