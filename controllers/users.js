const Sequelize = require('sequelize');
const path = require('path');

class Users {
  constructor() {
    this.sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.resolve(__dirname, '../stock-record.db'),
      operatorsAliases: false,
      logging: false,
    });
    this.model = this.sequelize.define('users', {
      // id: {
      //   type: Sequelize.INTEGER,
      //   autoIncrement: true,
      //   primaryKey: true
      // },
      name: {
        primaryKey: true,
        type: Sequelize.STRING(20),
      },
      balance: {
        type: Sequelize.DOUBLE(),
      },
    }, {
      freezeTableName: true,
      timestamps: false,
    });
    this.model.sync();
  }

  async getUsers(query) {
    return this.model.findAll({
      where: query,
      raw: true,
    });
  }

  async editBalance(balance, name) {
    return this.model.update(
      { balance: Sequelize.literal(`balance + ${balance}`) },
      { where: { name }});
  }

  async test() {
    // await this.model.create({
    //   name: 'zyw',
    //   balance: 1500
    // })
    const users = await this.model.findAll({
      // where: {
      //   generalID:
      // }
      raw: true,
    });
    console.log(users);
  }
}

// const users = new Users();
// users.test().then(() => {
//   console.log('123');
// })
module.exports = Users;