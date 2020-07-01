const Sequelize = require('sequelize');
const path = require('path');
const NP = require('number-precision');

class Status {
  constructor() {
    this.sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.resolve(__dirname, '../stock-record.db'),
      operatorsAliases: false,
      logging: false,
    });
    this.model = this.sequelize.define('status', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(50),
      },
      stockName: {
        type: Sequelize.STRING(20),
      },
      amount: {
        type: Sequelize.DOUBLE(),
      },
      price: {
        type: Sequelize.DOUBLE(),
      },
    }, {
      freezeTableName: true,
      timestamps: false,
    });
    this.model.sync();
  }

  async getStatus(query) {
    return this.model.findAll({
      where: query,
      raw: true,
    });
  }

  async editAmount(amount, price, stockName, name) {
    const status = await this.model.findOne({
      where: { name, stockName },
      raw: true,
    })
    if (status) {
      const total = status.price * status.amount + amount * price;
      const namount = status.amount + amount;
      const nprice = NP.round(NP.divide(total, namount), 2)
      status.amount = namount;
      status.price = nprice;
      // await status.save();
      this.model.update(
        {
          amount: namount,
          price: nprice,
        },
        { where: { name, stockName }}
      )
    } else {
      console.log({
        name,
        stockName,
        amount,
        price,
      });
      await this.model.create({
        name,
        stockName,
        amount,
        price,
      })
    }
    return status;
  }

  async test() {
    await this.model.create({
      name: '王孜帆',
      stockName: 'UAL',
      amount: 20.0,
      price: 34.2,
    })
    // const users = await this.model.findAll({
    //   // where: {
    //   //   generalID:
    //   // }
    //   raw: true,
    // });
    console.log(users);
  }
}

// const status = new Status();
// status.test().then(() => {
//   console.log('123');
// })
module.exports = Status;