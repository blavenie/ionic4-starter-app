# SUMARiS app
An Ionic 4 + Angular 5 App, with login features


## Compile from source

1. Install Node.js v8+
3. Install global dependencies: 
```
npm install -g ionic cordova
```
3. Clone the repo: `git clone ...`
4. Install project dependencies
```
cd sumaris-app
yarn
```

5. Start the server (with GraphQL API)
```
cd ionic4-starter-app/server
node index
```

A GraphQL editor should be accessible at [localhost:7777/graphql](http://localhost:7777/graphql)

6. Start app
```
cd ionic4-starter-app
ionic serve -l
```

The application should be accessible at [localhost:8100](http://localhost:8100)

7. Build a release
```
npm run build --prod --release
```
