This readme file will give you steps in order to replicate the installation process. Before doing anything of course, download the repository 

# Backend Set-up

## Server dependancies

- Go to the **backend** folder

- Run the command "**npm install**" in order to install the majority of required packages
    Make sure you to install the following: 
        Node.js (LTS version recommended)
        npm (comes with Node.js)

- If some backend dependancies are still missing, please run the following command to install everything manually: **"npm install express mongoose cors dotenv bcryptjs jsonwebtoken socket.io"**

## Running the Server

1. To start the server, use the command
    "npm run dev"  or "node index.js"

2. Don't worry about the database console message, we will set it up shortly

# Setting up the database

Our server will require the connection to the mongoDB database, there are two ways to achive connection: 

1. (Option #1) Start your local mongoDb database 
    1. Go to this link to download:  https://www.mongodb.com/try/download/community
    2. Install according to your OS instructions
    3. Start the database by running **"mongod"**

2. (Option #2) Use Atlas mongoDB database cloud hosting 
    1. Create an account on https://www.mongodb.com/atlas
    2. Create a free cluster with desired security settings

    3. Create the database with any name, this project used the name **"cs-314-project"**
    4. Install the mongoDB Compass GUI to interact with your cluster of databases https://www.mongodb.com/try/download/compass
    5. Make sure you can set-up the new connection in compass GUI to add your cluster created on Atlas
    6. Copy the connection string specific to your database in compass GUI for the next set

Note that this project used Atlas to set up mongoDB database.

Regardless of the method you chose to set up your database, make sure that:
1. Make sure your mondoDB database is up and running
2. You obtain the connection string of your database
3. Replace the existing database connection in **MONGO_URI_NORMAL** variable located in the **.env** folder with your database connection.
4. Make sure that your database contains the following collections:
    - **channels**
    - **messages**
    - **users**

## Setting up the Jest testing

1. If you really want to use jest testing, please run the installation command
    - **"npm install --save-dev jest @shelf/jest-mongodb supertest babel-jest @babel/preset-env @babel/core"**

2. You will require additional database to use jest testing. 
    - Please create additional testing database with different name using the method of your choice in the same cluster. 
    - Replace the existing testing database connection in **MONGO_URI_TEST** variable located in the **.env** folder with your database connection.

3. To start Jest testing, please run:
    - **""npm test""**

##  Final Server Notes

1.  If everything is installed correctly, the server will start as localhost with some port, the message will be displayed on the console.
    - If you want to add change the default port of the localhost, please navigate to the **.env** folder and change the **PORT** value

# Front-end Set-up