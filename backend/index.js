const mysql = require('mysql');
const express = require('express')
const app = express()
const nodeadmin = require('nodeadmin')
const helmet = require('helmet')
const schedule = require('node-schedule');

// Example cronjob for every minute
// var j = schedule.scheduleJob('0 * * * * *', function(){
//   console.log('The answer to life, the universe, and everything!');
// });

// Add security to Express [https://expressjs.com/en/advanced/best-practice-security.html]
app.use(helmet())
// Prettify output
app.set('json spaces', 40);

// Allow API Calling
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// Error logging
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;
const myFormat = printf(info => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});
const logger = createLogger({
  format: combine(
    timestamp(),
    myFormat
  ),
  level: 'info',
  transports: [
    new (transports.File)({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new (transports.File)({
      filename: 'logs/combined.log'
    })
  ]
});

// Setup loading data task for everyday at 1AM
let daily_task = schedule.scheduleJob('0 1 * * *', function(){
  runLoadData();
});

function runLoadData() {
  // Create query for each steps
  let query_loaddata_create_temp = `
    CREATE TABLE stocks.temp_data (
      pricing_date TEXT NULL,
      symbol_ticker TEXT NULL,
      symbol_exchange TEXT NULL,
      currency_iso TEXT NULL,
      price_open TEXT NULL,
      price_close TEXT NULL,
      volume TEXT NULL
    );`

  let new_line = "\\n"
  let query_loaddata_load_temp = `
    LOAD DATA LOCAL INFILE ?
      INTO TABLE stocks.temp_data
      FIELDS TERMINATED BY ','
      ENCLOSED BY '"'
      LINES TERMINATED BY '${new_line}'
      IGNORE 1 ROWS;`

  let query_loaddata_clean_temp = `
    UPDATE stocks.temp_data
      SET price_open = NULL
      WHERE price_open = '' AND symbol_exchange = 'ASX';

    UPDATE stocks.temp_data
      SET price_close = NULL
      WHERE price_open = '' AND symbol_exchange = 'ASX';

    UPDATE stocks.temp_data
      SET volume = NULL
      WHERE volume = '' AND symbol_exchange = 'ASX';`
  
  let query_loaddata_load_asx = `
  USE stocks;
  INSERT IGNORE INTO asx_data
    SELECT NULL, CAST(STR_TO_DATE(pricing_date, '%Y-%m-%d %h:%i:%s') AS DATE) AS price_date, symbol_ticker AS stock_name, price_open, price_close, volume
    FROM temp_data
    WHERE symbol_exchange = 'ASX';`

  let query_loaddata_drop_temp = `DROP TABLE IF EXISTS stocks.temp_data;`

  // Run Query
  console.log('Running: 1 Dropping Temp')
  logInfo('Running scheduled load data')
  pool.query(query_loaddata_drop_temp, function (err, result) {
    if(err) logError('SQL', err)

    logInfo('Finished: 1 Dropping Temp')
    console.log('Running 2 Create Temp')
    pool.query(query_loaddata_create_temp, function (err, result) {
      if(err) logError('SQL', err)
      
      logInfo('Finished: 2 Create Temp')
      console.log('Running 3 Load Temp')
      let file_path = '/root/data/company_equity_dataset.txt'
      pool.query(query_loaddata_load_temp, [file_path], function (err) {
        if(err) logError('SQL', err)
  
        logInfo('Finished: 3 Load Temp')
        console.log('Running 4 Clean Temp')
        pool.query(query_loaddata_clean_temp, function (err) {
          if(err) logError('SQL', err)
          
          logInfo('Finished: 4 Clean Temp')
          console.log('Running 5 Load ASX')
          pool.query(query_loaddata_load_asx, function (err) {
            if(err) logError('SQL', err)
            
            logInfo('Finished: 5 Load ASX')
            console.log('Running 6 Drop Temp')
            pool.query(query_loaddata_drop_temp, function (err) {
              if(err) logError('SQL', err)
              logInfo('Finished Loading Data')
              console.log('Finished loading data')
            });
          });
        });
      });
    });
  });
}

// TODO: Temporary username/password. Need to store password outside Git for more security.
const pool = mysql.createPool({
  host : 'localhost',
  user : 'root',
  password : String.raw`7\+mk!Y'^]kMqN&j`,
  connectionLimit : 100,
  multipleStatements: true
});

// Function for logging error
function logError(log_type, err) {
  logger.log({
    level: 'error',
    message: log_type + ': ' + err
  })
  console.log(err)
}

function logInfo(info) {
  logger.log({
    level: 'info',
    message: info
  })
}

// Simple UI to manage DB
app.use(nodeadmin(app)); // TODO: Comment this line in production

app.get('/', (req, res) => {
  res.send('Hello! There is nothing to see here.')
});

// API
//- get chart data from the stock name
app.get('/get_stock/:stock_name', (req, res) => {
  let stock_name = req.params.stock_name;

  // Query Stock Name
  pool.query("SELECT pricing_date, stock_name, price_close FROM stocks.asx_data WHERE stock_name = ?;", stock_name, function (err, result, fields) {
    if(err) logError('SQL', err)

    // TODO: Format the data to suit frontend
    res.send(JSON.stringify(result));
  });
});

//- get list of ALL signals available
app.get('/signals', (req, res) => {
  // Query signals
  pool.query("SELECT signal_id, signal_name FROM stocks.signals;", function (err, result, fields) {
    if(err) logError('SQL', err)
    res.send(JSON.stringify(result));
  });
});

//- get list of stock name with the specified signal
app.get('/get_stock_signal/:signal_id/:signal_lv_min/:signal_lv_max', (req, res) => {
  let signal_id = req.params.signal_id;
  let signal_lv_min = req.params.signal_lv_min;
  let signal_lv_max = req.params.signal_lv_max;

  // Query Stock Name
  pool.query("SELECT asx_stockname, signal_level FROM stocks.signals_asxdata WHERE signal_id = ? AND signal_level BETWEEN ? AND ?;", [signal_id, signal_lv_min, signal_lv_max],
    function (err, result, fields) {
      if(err) logError('SQL', err)
      res.send(JSON.stringify(result));
  });
});

function generateStockSignal(stock, res) {
  return new Promise(function(resolve, reject) {
    // Get the first and last point of the stock
    pool.query("(SELECT pricing_date, price_close FROM stocks.asx_data WHERE stock_name = ? AND price_close IS NOT NULL ORDER BY pricing_date DESC LIMIT 1) UNION ALL (SELECT pricing_date, price_close FROM stocks.asx_data WHERE stock_name = ? AND price_close IS NOT NULL ORDER BY pricing_date ASC LIMIT 1)", [stock.stock_name, stock.stock_name],
      function (err, prices) {
        if(err) logError('SQL', err)

        let signal_name, signal_lv
        let signal_list = {
          rise: 1, fall: 2, 'no change': 3
        }

        if(prices.length == 2) {
          let last_price = prices[0].price_close
          let first_price = prices[1].price_close

          // See if it rise or fall, by how much
          // e.g. first_price = 1, last_price = 2 > percentage_change = (2*100/1 - 100) = 100% increase
          let signal_percent = +((last_price * 100 / first_price) - 100).toFixed(2)
          signal_name = (signal_percent > 0) ? 'rise' : (signal_percent == 0 ) ? 'no change' : 'fall'
          signal_lv = Math.abs(signal_percent)
          if(!isFinite(signal_lv)) { // the value will be 'Infinity' or 'NaN' if there is a missing price
            signal_name = 'no change'
            signal_lv = 0
          }
        } else {
          // Not enough data
          signal_name = 'no change'
          signal_lv = 0
        }

        // Store signal & signal level in the table
        pool.query("INSERT INTO stocks.signals_asxdata VALUES( ?, ?, ?)", [signal_list[signal_name], stock.stock_name, signal_lv],
          function (err, result) {
            if(err) logError('SQL', err)
            res.write('Retrieve from Database:' + JSON.stringify(result));

          resolve()
        });
    })
  })
}

//- generate a signal and push into a table
app.get('/generate_signal_b89e474618981299ed5a140eb448d633', (req, res) => {
  
  // Get the list of all stock
  pool.query("SELECT DISTINCT stock_name FROM stocks.asx_data", function (err, all_stocks) {
    if(err) {
      logError('SQL', err)
    } else {
      // Loop through each stock to generate signal
      logInfo('Generating signal')

      all_stocks_promises = []
      all_stocks.forEach(stock => {
        all_stocks_promises.push( generateStockSignal( stock, res ) )
      });

      Promise.all( all_stocks_promises ).then(results => {
        logInfo('Finished Generating Signal')
        res.end()
      })
    }
  });

});

//- [Scheduled Task] load the data file into database
app.get('/load_data_b5b5b7d6c523f38a7871b85dc9a256e3', (req, res) => {
  
  runLoadData();

});

// Run the server
app.listen(8080, () => console.log('Server running at http://localhost:8080/'))