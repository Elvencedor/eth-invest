import path from 'path'
let cfgPaths = path.join(__dirname, '..', 'config')
cfgPaths += path.delimiter
cfgPaths += path.join(__dirname, '..', '..')
process.env['NODE_CONFIG_DIR'] = cfgPaths
import 'reflect-metadata'
import { Express } from 'express'
import { createConnection } from 'typeorm'
import { testDecode } from './lib/services/deposit'
const config = require('config')
const { http }: {http: Express} = require('./lib/server')
const port:number = config.get('server.port')
const isMasterProcess = require('is-master-process')

createConnection({
  ...config.get('database'),
  synchronize: true,
  entities: [`${__dirname}/db/entity/*`]
}).then(async() => {
  console.info(`Established database connection...`)

  if (isMasterProcess) {
    const seedConn = await createConnection({
      ...config.get('database'),
      name: 'seed',
      synchronize: true,
      entities: [`${__dirname}/db/entity/*`],
      migrations: [`${__dirname}/db/seeds/*`]
    })
    
    await seedConn.runMigrations({
      transaction: "none"
    })
    await seedConn.close()

    // updateInvestments()
    // setInterval(() => {
    //   updateInvestments()
    // }, 60000)
    
  }

  testDecode('0x0d90d7fce5ca47842ecb0b7a3152af615b1863adbbab393bbb16381c2b5e9b53')
  
  // Initialise worker
  import(`./lib/services/${config.get('misc.priceService')}`)
    .then(priceService => {
      priceService.init()
        .then(() => {
          http.listen(port, () => {
            console.info(`HTTP server is running on port ${port}`)
          })
        })
        .catch((err: { message: any }) => {
          console.error('Price API error:', err.message)
          process.exit(1)
        })
    })

}).catch(err => console.error('Database connection error:', err.message))