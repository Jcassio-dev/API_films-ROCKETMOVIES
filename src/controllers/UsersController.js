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

        await database.run("INSERT INTO users(name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);

        return response.status(201).json(`Usuário Cadastrado!`)
    }
    async update(request, response){
        const {name, email, password, old_password} = request.body;
        const user_id = request.user.id;

        const database = await sqliteConnection();
        const user = await database.get("SELECT * FROM users WHERE id=(?)", [user_id]);

        if(!user){
            throw new AppError("O usuário não existe!");
        }

        const userWithUpdatedEmail = await database.get("SELECT * FROM users WHERE email=(?)", [email]);

        if(userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id){
            throw new AppError("Este Email já está em uso.");
        }

        user.name = name ?? user.name;
        user.email = email ?? user.email;

        if(password && !old_password){
            throw new AppError("Você precisa informar a senha antiga!");
        }


        if(password && old_password){
            const checkOldPassword = await compare(old_password, user.password);

            if(!checkOldPassword){
                throw new AppError("A senha antiga não confere!");
            }

            user.password = await hash(password, 8)
        }
        await database.run(`UPDATE users 
        SET
        name = ?,
        email = ?,
        password = ?,
        updated_at = DATETIME('now')
        WHERE id = ?
        `, [user.name, user.email, user.password, user_id]);
        return response.status(200).json("Usuário atualizado")

    }
}

module.exports = UsersController;