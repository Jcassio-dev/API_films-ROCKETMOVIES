const {hash, compare} = require("bcryptjs")
const sqliteConnection = require("../database/sqlite");
const AppError = require("../utils/AppError");

class UsersController{
   async create(request, response){
        const {name, email, password} = request.body;

        const database = await sqliteConnection();
        const checkUserExist = await database.get('SELECT * FROM users WHERE email=(?)', [email])
        if(checkUserExist){
            throw new AppError("Este E-mail já está em uso")
        }

        const hashedPassword = await hash(password, 8);

        response.status(201).send(`${name} ${email} ${password}`)
    }
}

module.exports = UsersController;