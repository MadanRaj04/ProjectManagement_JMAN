FROM node:20
 
WORKDIR /src/app
 
COPY . .
 
RUN npm install
 
RUN npx prisma generate
 
EXPOSE 3000
 
CMD ["npm", "run", "dev"]
 