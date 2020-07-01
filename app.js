const Koa = require('koa');
const views = require('koa-views');
const createRouter = require('koa-bestest-router')
const serve = require('koa-better-serve')
const bodyParser = require('koa-bodyparser');
const path = require('path');
const Records = require('./controllers/records');
const Users = require('./controllers/users');
const Status = require('./controllers/status');
const NP = require('number-precision');

class App {
  constructor() {
    // this.worker = new Worker();
    // this.configController = new ConfigController(this.models.configModel);
    this.records = new Records();
    this.users = new Users();
    this.status = new Status();
    const routerMiddleware = createRouter({
      GET: {
        '/': async (ctx) => await this.index(ctx),
        '/index': async (ctx) => await this.index(ctx),
        '/home': async (ctx) => await this.index(ctx),
        '/edit': async (ctx) => await this.edit(ctx),
      },
      POST: {
        '/user': async (ctx) => {
          const name = ctx.request.body.name;
          const records = await this.records.getRecords({ name });
          const users = await this.users.getUsers({ name });
          const userStatus = await this.status.getStatus({ name });
          const beautyRecords = []
          records.forEach((record) => {
            beautyRecords.push({
              number: record.rid,
              name: record.name,
              time: new Date(record.time).toLocaleString(),
              stockId: record.stockId,
              action: record.action,
              amount: NP.round(record.amount, 2),
              price: NP.round(record.price, 2),
              valid: record.valid,
            })
          })
          ctx.body = {
            records: beautyRecords,
            balance: NP.round(users[0].balance, 2),
            userStatus,
          };
        },
        '/invalidate': async (ctx) => {
            const { balance, name } = await this.records.invalidate(ctx.request.body.id);
            await this.users.editBalance(balance, name);
          ctx.body = {};
        },
        '/new': async (ctx) => {
          const { user, action, stockId, amount, price } = ctx.request.body;
          let balance = NP.round(NP.times(amount, price), 2);
          // let balance = amount * price;
          if (action === 'buy') {
            balance *= -1;
          }
          await this.records.add({
            name: user,
            time: Date.now(),
            stockId,
            action,
            amount,
            price,
            valid: true,
          })
          await this.users.editBalance(balance, user);
          if (action === 'sell') {
            await this.status.editAmount(-parseFloat(amount), parseFloat(price), stockId, user);
          } else {
            await this.status.editAmount(parseFloat(amount), parseFloat(price), stockId, user);
          }
          ctx.body = {};
        }
      }
    });
    this.app = new Koa();
    this.app.use(views(path.resolve(__dirname, './static/template'), {map: {html: 'handlebars'}}));
    this.app.use(bodyParser());
    this.app.use(routerMiddleware)
    this.app.use(serve(path.resolve(__dirname, './static'), '/static'));
  }

  start() {
    this.app.listen(2020);
    console.log('listening on port 2020');
  }

  async index(ctx) {
    const records = await this.records.getRecords();
    const users = await this.users.getUsers();
    const status = await this.status.getStatus();
    const beautyRecords = []
    records.forEach((record) => {
      beautyRecords.push({
        number: record.rid,
        name: record.name,
        time: new Date(record.time).toLocaleString(),
        stockId: record.stockId,
        action: record.action,
        amount: NP.round(record.amount, 2),
        price: NP.round(record.price, 2),
        valid: record.valid,
      })
    })

    ctx.state = {
      records: beautyRecords,
      users,
      status,
    }
    return ctx.render('index.html')
  }

  async edit(ctx) {
    const records = await this.records.getRecords();
    const users = await this.users.getUsers();
    const beautyRecords = []
    records.forEach((record) => {
      beautyRecords.push({
        number: record.rid,
        name: record.name,
        time: new Date(record.time).toLocaleString(),
        stockId: record.stockId,
        action: record.action,
        amount: NP.round(record.amount, 2),
        price: NP.round(record.price, 2),
        valid: record.valid,
      })
    })
    ctx.state = {
      records: beautyRecords,
      users,
    }
    return ctx.render('edit.html')
  }
}

const app = new App();
app.start();