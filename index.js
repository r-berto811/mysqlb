/**
 * Builder
 */
'use strict'

/**
 * Import dependencies.
 */
const mysql = require('mysql')
const Query = require('./lib/query')

/**
 * Builder class.
 * @class
 */
class Builder {
  /**
   * Builder constructor.
   * @constructor
   */
  constructor (options) {
    this._setDefaults()
    this._checkRequired(options)
    this._setOptions(options)
  }

  /**
   * Check if all required options is specified.
   * @param {Object} options
   * @private
   */
  _checkRequired (options) {
    if (!options.host) throw new Error(`Option 'host' is required`)
    if (!options.port) throw new Error(`Option 'port' is required`)
    if (!options.user) throw new Error(`Option 'user' is required`)
    if (!options.password) throw new Error(`Option 'password' is required`)
    if (!options.database) throw new Error(`Option 'database' is required`)
    return true
  }

  /**
   * Set option values to instance.
   * @param {Object} options
   * @private
   */
  _setOptions (options) {
    this._connectionData.host = options.host
    this._connectionData.port = options.port
    this._connectionData.user = options.user
    this._connectionData.password = options.password
    this._connectionData.database = options.database
  }

  /**
   * Set default options.
   * @private
   */
  _setDefaults () {
    this._table = null
    this._connectionData = {}
  }

  /**
   * Build and call select query.
   * @param {String} table
   * @returns {SelectBuilder}
   * @public
   */
  use (table) {
    return new Query(this, table)
  }

  /**
   * Call mysql query with created connection.
   * @param {String} query
   * @param {Array} data
   * @returns {Promise}
   * @public
   * @async
   */
  queryAsync (query, data) {
    return new Promise((resolve, reject) => {
      this.query(query, data, function (err, resultData) {
        if (err) return reject(err)
        resolve(resultData)
      })
    })
  }

  /**
   * Call mysql query with created connection.
   * @param {String} query
   * @param {Array} data
   * @param {Function} cb
   */
  query (query, data, cb) {
    this.connected((err, connection) => {
      if (err) return cb(err)
      connection.query(query, data, cb)
    })
  }

  /**
   * Call callback when connection is active.
   * @param {Function} cb
   * @public
   */
  connected (cb) {
    if (Builder._connection) {
      cb(null, Builder._connection)
    } else {
      this._createConnection(cb)
    }
  }

  /**
   * Call callback when connection is active.
   * @param {Function} cb
   * @public
   * @async
   */
  connectedAsycn () {
    return new Promise((resolve, reject) => {
      this.connected((err, connection) => {
        if (err) return reject(err)
        resolve(connection)
      })
    })
  }

  /**
   * Crete new database connection.
   * @param {Function} cb // callback
   * @private
   */
  _createConnection (cb) {
    const connection = mysql.createConnection({
      host: this._connectionData.host,
      port: this._connectionData.port,
      user: this._connectionData.user,
      password: this._connectionData.password,
      database: this._connectionData.database
    })
    connection.connect((err) => {
      Builder._connection = connection
      cb(err, connection)
    })
  }

  /**
   * Close database connection.
   * @public
   */
  closeConnection (cb) {
    if (!Builder._connection) {
      cb(null)
    }
    Builder._connection.end((err) => {
      Builder._connection = null
      cb(err)
    })
  }

  /**
   * Close database connection.
   * @public
   * @async
   */
  closeConnectionAsync () {
    return new Promise((resolve, reject) => {
      this.closeConnection(function (err) {
        if (err) return reject(err)
        resolve(true)
      })
    })
  }
}

// export dependencies
module.exports = Builder
