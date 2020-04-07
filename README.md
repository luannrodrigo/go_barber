<h1 align = "center">
<img alt = "GoStack" src = ".github/GoStackLogo.png" width = "200px" />
</h1>

<h3 align = "center">
GoBarber
</h3>


## 📥 Installation and execution

Clone this repository.

### Internal process

1. From the root of the project, among the masses of the back-end running `cd backend`;
2. Run `yarn` to install as dependencies;
3. Create a database in `postgres` with the name of` gobarber`;
4. Run `cp .env.example .env` and fill the` .env` file with ** YOUR ** environment variables;
5. Run `yarn sequelize db: migrate` to perform as migrations;
6. Run `yarn dev` to start the server.

### Front-end web

_ps: Before executing, remember to start or backend this project_

1. From the root of the project, among the masses of the web frontend running `cd frontend`;
2. Run `yarn` to install as dependencies;
3. Run `yarn start` to start the client.

### Frontend Mobile

_ps: Before executing, remember to start or backend this project_

1. From the root of the project, among the masses of the mobile frontend running `cd mobile`;
2. Run `yarn` to install as dependencies;
3. Run `yarn react-native run-ios` or yarn` react-native run-android` depending on the OS.