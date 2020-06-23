const Sequelize = require('sequelize');
const path = require('path');

class Records {
  constructor() {
    this.sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.resolve(__dirname, '../stock-record.db'),
      operatorsAliases: false,
      logging: false,
    });
    this.model = this.sequelize.define('records', {
      rid: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(20),
      },
      time: {
        type: Sequelize.INTEGER(),
      },
      stockId: {
        type: Sequelize.STRING(20),
      },
      action: {
        type: Sequelize.STRING(20),
      },
      amount: {
        type: Sequelize.INTEGER(),
      },
      price: {
        type: Sequelize.INTEGER(),
      },
      valid: {
        type: Sequelize.BOOLEAN(),
      },
    }, {
      freezeTableName: true,
      timestamps: false,
    });
    this.model.sync();
  }

  async getRecords(query) {
    return this.model.findAll({
      where: query,
      raw: true,
    });
  }

  async add(record) {
    await this.model.create(record)
    // return record.price * record.amount;
  }

  async remove(rid) {
    const record = await this.model.findOne({ where: { rid }, raw: true });
    if (!record) {
      return 0;
    }
    const balance = record.price * record.amount;
    await this.model.destroy({ where: { rid } })
    return balance;
  }

  async invalidate(rid) {
    const record = await this.model.findOne({ where: { rid }});
    if (!record) {
      return 0;
    }
    const balance = record.price * record.amount;
    const name = record.name;
    record.valid = false;
    await record.save();
    return { name, balance };
  }

  async test() {
    await this.model.create({
      name: 'wzf',
      time: Date.now(),
      stockId: 'BA',
      action: 'buy',
      amount: 10,
      price: 180,
      valid: true,
    })
    await this.model.create({
      name: 'zyw',
      time: Date.now(),
      stockId: 'PLAY',
      action: 'buy',
      amount: 10,
      price: 14,
      valid: false,
    })
  }
}

// const records = new Records();
// records.test().then(() => {
//   console.log('123');
// })
module.exports = Records;