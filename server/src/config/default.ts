export default {
  server: {
    port: 3000,
    // CORS
    corsOrigins: [
      'http://localhost:8080',
      'http://localhost:8081'
    ],
    // Client
    clientHost: "http://localhost:8081"
  },
  api: {
    prefix: 'api',
    secret: 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-='
  },
  database: {
    type: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'crespodb',
    schema: 'public',
    charset: 'UTF8MB4_UNICODE_CI',
    timezone: 'local',
    logging: true
  },
  redis: {
    connStr: null,
    host: '127.0.0.1',
    port: 6379
  },
  // Crypto
  cryptocurrency: {
    ethereum: {
      blockLowerBound: 8945135,
      // mainWallet: "0x063f135b362549df2acc3266c5d76711e6e1f33e",
      mainWallet: "0x9706eD6fAb6ad47d4f42d6e85E5BF3eAb96c37D8",
      erc20Contracts: {
        ETH: {
          address: "yourEthAddress",
          precision: 18
        }
      }
    },
    etherscan: {
      apiKey: "CZUM587DGVK8CD5UB3DJPR4UC3GZZ6Z25A",
      // Ethereum network (kovan|mainnet)
      network: "kovan"
    },
    crex24: {
      requestTimer: 30000,
    },
    southxchange: {
      requestTimer: 30000,
    }
  },
  // Mail configuration
  mail: {
    // Host
    host: "smtp.mailtrap.io",
    // Port
    port: 2525,
    // Username
    username: "6a9cb178587053",
    // Password
    password: "8fd523363c0d53",
    // From
    from: "noreply@domain.com",
    support: "support@domain.com"
  },
  // Miscellaneous
  misc: {
    // Feature states
    enableFeature: {
      registration: true,
      deposit: true,
      investment: true,
      withdrawal: true
    },
    // Choose price API service (crex24 || southxchange)
    priceService: "southxchange",
    // Referral bonus percentage
    refPercentage: 5,
    // Resend confirmation mail duration (10 m in ms)
    resendConfirmationMailDuration: 600000,
    // Limits (USD)
    limit: {
      deposit: {
        min: 10
      },
      withdrawal: {
        min: 25
      } 
    },
    //paystack secret key
    paystackSecretKey: 'Bearer sk_test_95a9b3d3f60fdd98ece68c4ca8a76e0f496c0cef'
  }
}