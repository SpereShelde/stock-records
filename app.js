const Koa = require('koa');
const views = require('koa-views');
const createRouter = require('koa-bestest-router')
const serve = require('koa-better-serve')
const bodyParser = require('koa-bodyparser');
const path = require('path');
const Records = require('./controllers/records');
const Users = require('./controllers/users');

class App {
  constructor() {
    // this.worker = new Worker();
    // this.configController = new ConfigController(this.models.configModel);
    this.records = new Records();
    this.users = new Users();
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
          const records = await this.records.getRecords({
            name,
          });
          const users = await this.users.getUsers({
            name: name
          });
          const beautyRecords = []
          records.forEach((record) => {
            beautyRecords.push({
              number: record.rid,
              name: record.name,
              time: new Date(record.time).toLocaleString(),
              stockId: record.stockId,
              action: record.action,
              amount: record.amount,
              price: record.price,
              valid: record.valid,
            })
          })
          ctx.body = {
            records: beautyRecords,
            balance: users[0].balance,
          };
        },
        '/invalidate': async (ctx) => {
            const { balance, name } = await this.records.invalidate(ctx.request.body.id);
            await this.users.editBalance(balance, name);
          ctx.body = {};
        },
        '/new': async (ctx) => {
          const { user, action, stockId, amount, price } = ctx.request.body;
          let balance = amount * price;
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
    const beautyRecords = []
    records.forEach((record) => {
      beautyRecords.push({
        number: record.rid,
        name: record.name,
        time: new Date(record.time).toLocaleString(),
        stockId: record.stockId,
        action: record.action,
        amount: record.amount,
        price: record.price,
        valid: record.valid,
      })
    })
    ctx.state = {
      records: beautyRecords,
      users,
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
        amount: record.amount,
        price: record.price,
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