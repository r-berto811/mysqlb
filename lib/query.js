/**
 * Select Builder
 */
'use strict'

/**
 * Import dependencies.
 */
const Paginator = require('./paginator')

/**
 * Building select query.
 * @class
 */
class Query {
  /**
   * Select builder constructor.
   * @param {Object} builder
   * @param {String} table
   */
  constructor (builder, table) {
    this._setDefaults()
    this._setData(builder, table)
  }

  /**
   * Set service data.
   * @param {Object} builder
   * @param {String} table
   * @private
   */
  _setData (builder, table) {
    this._builder = builder
    this._table = table
  }

  /**
   * Set default values.
   * @private
   */
  _setDefaults () {
    // builder instance
    this._builder = null
    // used table
    this._table = ''
    // part of query with SELECT
    this._selectStr = '*'
    // part of query with WHERE conditions
    this._where = {
      str: '',
      data: []
    }
    // part of query with JOIN
    this._joinStr = ''
    // part of query with ORDER
    this._orderStr = ''
    // part of query with LIMIT
    this._limitStr = ''
    // part of query with OFFSET
    this._offsetStr = ''
    // part of query with UPDATE
    this._update = {
      str: '',
      data: []
    }
    // part of query with INSERT
    this._insert = {
      str: '',
      data: []
    }
    // part of query with INSERT or update if duplicate keys
    this._insertOnDuplicateKeys = {
      str: '',
      data: []
    }
    // final query string to execute
    this._queryStr = null
    // data, used in query string
    this._queryData = []
  }

  /**
   * Where condition.
   * @param {String} field
   * @param {String} comparison
   * @param {String} value
   * @returns {Query}
   * @public
   */
  where (field, comparison, value) {
    if (field.indexOf('.') < 0) {
      field = `${this._table}.${field}`
    }
    this._where.str += ` AND ${field} ${comparison} ?`
    this._where.data.push(value)
    return this
  }

  /**
   * Raw where query.
   * @param {String} rawQuery
   * @param {Array} queryData
   * @returns {Query}
   * @public
   */
  whereRaw (rawQuery, queryData) {
    if (!queryData) queryData = []
    this._where.str += ` AND ${rawQuery}`
    for (let dataValue of queryData) {
      this._where.data.push(dataValue)
    }
    return this
  }

  /**
   * Where in query.
   * @param {String} field
   * @param {Array} values
   * @returns {Query}
   * @public
   */
  whereIn (field, values) {
    if (!values) values = []
    const marks = []
    for (let value of values) {
      this._where.data.push(value)
      marks.push('?')
    }
    const marksStr = marks.join(', ')
    if (field.indexOf('.') < 0) {
      field = `${this._table}.${field}`
    }
    this._where.str += ` AND ${field} IN (${marksStr})`
    return this
  }

  /**
   * Add JOIN part to query
   * @param {String} joinType
   * @param {String} table
   * @param {String} t1field
   * @param {String} t2field
   * @param {String} comparison
   * @returns {Query}
   * @private
   */
  _join (joinType, table, t1field, t2field, comparison) {
    if (!comparison) comparison = '='
    this._joinStr += ` ${joinType} JOIN ${table} ON ${this._table}.${t1field} ${comparison} ${table}.${t2field}`
    return this
  }

  /**
   * Add LEFT JOIN part to query
   * @param {String} table
   * @param {String} t1field
   * @param {String} t2field
   * @param {String} comparison
   * @returns {Query}
   * @private
   */
  leftJoin (table, t1field, t2field, comparison) {
    return this._join('LEFT', table, t1field, t2field, comparison)
  }

  /**
   * Add RIGHT JOIN part to query
   * @param {String} table
   * @param {String} t1field
   * @param {String} t2field
   * @param {String} comparison
   * @returns {Query}
   * @private
   */
  rightJoin (table, t1field, t2field, comparison) {
    return this._join('RIGHT', table, t1field, t2field, comparison)
  }

  /**
   * Add INNER JOIN part to query
   * @param {String} table
   * @param {String} t1field
   * @param {String} t2field
   * @param {String} comparison
   * @returns {Query}
   * @private
   */
  innerJoin (table, t1field, t2field, comparison) {
    return this._join('INNER', table, t1field, t2field, comparison)
  }

  /**
   * Select only fields.
   * @param {Array} fields
   * @returns {Query}
   * @public
   */
  only (fields) {
    if (this._selectStr.length > 1) {
      throw new Error('Fields could be set only once')
    }
    this._selectStr = ` ${fields.join(', ')}`
    return this
  }

  /**
   * Like where condition.
   * @param {String} field
   * @param {String} value
   * @returns {Query}
   * @public
   */
  like (field, value) {
    this.where(field, ' LIKE', value)
    return this
  }

  /**
   * Order by.
   * @param {String} field
   * @param {String} order // ASC|DESC
   * @returns {Query}
   * @public
   */
  orderBy (field, order) {
    order = String(order).toUpperCase()
    if (order !== 'ASC' && order !== 'DESC') {
      throw new Error('Invalid order value')
    }
    if (this._orderStr.length) {
      throw new Error('Order could be set only once')
    }
    this._orderStr += ` ORDER BY ${this._table}.${field} ${order}`
    return this
  }

  /**
   * Quantity limit.
   * @param {Number} quantity
   * @returns {Query}
   * @public
   */
  limit (quantity) {
    if (!Number.isInteger(parseInt(quantity))) {
      throw new Error('Limit value is not a number')
    }
    if (this._limitStr.length) {
      throw new Error('Limit could be set only once')
    }
    this._orderStr += ` LIMIT ${quantity}`
    return this
  }

  /**
   * Quantity limit.
   * @param {Number} quantity
   * @returns {Query}
   * @public
   */
  offset (quantity) {
    if (!Number.isInteger(parseInt(quantity))) {
      throw new Error('Offset value is not a number')
    }
    if (this._offsetStr.length) {
      throw new Error('Offset could be set only once')
    }
    this._offsetStr += ` OFFSET ${quantity}`
    return this
  }

  /**
   * Create new instance
   * @param {Object} data
   * @param {Boolean} withUpdate
   * @param {Function} cb
   * @public
   */
  create (data, withUpdate, cb) {
    let insertData = []
    for (let field in data) {
      insertData.push(`${field}=?`)
      this._insert.data.push(data[field])
    }
    this._insert.str += insertData.join(', ')
    if (withUpdate) {
      for (let field in data) {
        this._insertOnDuplicateKeys.data.push(data[field])
      }
      this._insertOnDuplicateKeys.str = this._insert.str
    }
    this._createInsertQuery()
    this._builder.query(this._queryStr, this._queryData, cb)
  }

  /**
   * Create new instance
   * @param {Object} data
   * @param {Boolean} withUpdate
   * @param {Function} cb
   * @public
   * @async
   */
  createAsync (data, withUpdate) {
    return new Promise((resolve, reject) => {
      this.create(data, withUpdate, (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }

  /**
   * Update query
   * @param {Object} data
   * @param {Function} cb
   * @public
   */
  update (data, cb) {
    let updateData = []
    for (let field in data) {
      if (field.indexOf('.') > -1) {
        updateData.push(`${field}=?`)
      } else {
        updateData.push(`${this._table}.${field}=?`)
      }
      this._update.data.push(data[field])
    }
    this._update.str += updateData.join(', ')
    this._createUpdateQuery()
    this._builder.query(this._queryStr, this._queryData, cb)
  }

  /**
   * Update query
   * @param {Object} data
   * @public
   * @async
   */
  updateAsync (data) {
    return new Promise((resolve, reject) => {
      this.update(data, (err, data) => {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }

  /**
   * Delete query
   * @param {Function} cb
   * @public
   */
  delete (cb) {
    this._createDeleteQuery()
    this._builder.query(this._queryStr, this._queryData, cb)
  }

  /**
   * Delete query
   * @public
   * @async
   */
  deleteAsync () {
    return new Promise((resolve, reject) => {
      this.delete((err, data) => {
        if (err) return reject(err)
        return data
      })
    })
  }

  /**
   * Check if UPDATE query is able.
   * @private
   */
  _checkUpdateIsAble () {
    function error (parameter) {
      throw new Error (`Parameter '${parameter}' is forbidden in UPDATE query`)
    }
    if (this._selectStr.length > 1) error('only')
    if (this._orderStr) error('orderBy')
    if (this._limitStr) error('limit')
    if (this._offsetStr) error('offset')
    return true
  }

  /**
   * Check if DELETE query is able.
   * @private
   */
  _checkDeleteIsAble () {
    function error (parameter) {
      throw new Error (`Parameter '${parameter}' is forbidden in DELETE query`)
    }
    if (this._selectStr.length > 1) error('only')
    if (this._orderStr) error('orderBy')
    if (this._limitStr) error('limit')
    if (this._offsetStr) error('offset')
    return true
  }

  /**
   * Check if SELECT query is able.
   * @private
   */
  _checkSelectIsAble () {
    return true
  }

  /**
   * Check if INSERT query is able.
   * @private
   */
  _checkInsertIsAble () {
    function error (parameter) {
      throw new Error (`Parameter '${parameter}' is forbidden in INSERT query`)
    }
    if (this._selectStr.length > 1) error('only')
    if (this._orderStr) error('orderBy')
    if (this._limitStr) error('limit')
    if (this._offsetStr) error('offset')
    if (this._where.str) error('where')
    if (this._joinStr) error('join')
    return true
  }

  /**
   * Create INSERT query.
   * @private
   */
  _createInsertQuery () {
    this._checkInsertIsAble()
    this._queryStr = ''
    this._queryStr += `INSERT INTO ${this._table} `
    this._queryStr += `SET ${this._insert.str} `
    this._queryData = [...this._queryData, ...this._insert.data]
    if (this._insertOnDuplicateKeys.str.length > 0) {
      this._queryStr += `ON DUPLICATE KEY UPDATE ${this._insertOnDuplicateKeys.str} `
      this._queryData = [...this._queryData, ...this._insertOnDuplicateKeys.data]
    }
  }

  /**
   * Create UPDATE query.
   * @private
   */
  _createUpdateQuery () {
    this._checkUpdateIsAble()
    this._queryStr = ''
    this._queryStr += `UPDATE ${this._table} `
    this._queryStr += `${this._joinStr} `
    this._queryStr += `SET ${this._update.str} `
    this._queryData = [...this._queryData, ...this._update.data]
    this._queryStr += `WHERE 1 ${this._where.str} `
    this._queryData = [...this._queryData, ...this._where.data]
  }

  /**
   * Create DELETE query.
   * @private
   */
  _createDeleteQuery () {
    this._checkDeleteIsAble()
    this._queryStr = ''
    this._queryStr += `DELETE FROM ${this._table} `
    this._queryStr += `${this._joinStr} `
    this._queryStr += `WHERE 1 ${this._where.str} `
    this._queryData = [...this._queryData, ...this._where.data]
  }

  /**
   * Create SELECT query.
   * @private
   */
  _createSelectQuery () {
    this._checkSelectIsAble()
    this._queryStr = ''
    this._queryStr += `SELECT ${this._selectStr} FROM ${this._table} `
    this._queryStr += `${this._joinStr} `
    this._queryStr += `WHERE 1 ${this._where.str} `
    this._queryData = [...this._queryData, ...this._where.data]
    this._queryStr += `${this._orderStr} ${this._limitStr} ${this._offsetStr} `
  }

  /**
   * Get SELECT items.
   * @param {Function} cb
   * @public
   */
  get (cb) {
    this._createSelectQuery()
    this._builder.query(this._queryStr, this._queryData, cb)
  }

  /**
   * Get SELECT items.
   * @returns {Object} // database data
   * @public
   * @async
   */
  getAsync () {
    return new Promise((resolve, reject) => {
      this.get(function (err, data) {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }

  /**
   * Find item by primary key.
   * @param {Int} id
   * @param {Function} cb
   * @public
   */
  find (id, cb) {
    this.where('id', '=', id)
    this.getFirst((err, data) => {
      if (err) return cb(err)
      cb(err, data)
    })
  }

  /**
   * Find item by primary key.
   * @param {Int} id
   * @public
   * @async
   */
  findAsync (id) {
    return new Promise((resolve, reject) => {
      this.find(id, function (err, data) {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }

  /**
   * Get first item of query.
   * @param {Function} cb
   * @public
   */
  getFirst (cb) {
    this.limit(1)
    this.get(function (err, data) {
      if (err) return cb(err)
      if (data.length > 0) return cb(err, data[0])
      cb(err, null)
    })
  }
  /**
   * Get first item of query.
   * @returns {Object} // database data
   * @public
   * @async
   */
  getFirstAsync () {
    return new Promise((resolve, reject) => {
      this.getFirst(function (err, data) {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }

  /**
   * Get count of items.
   * @param {Function} cb
   * @public
   */
  getCount (cb) {
    this._selectStr = ` COUNT (*)`
    this.get(function (err, data) {
      if (err) return cb(err)
      cb(err, data[0]['COUNT (*)'])
    })
  }

  /**
   * Get count of items.
   * @public
   * @async
   */
  getCountAsync () {
    return new Promise((resolve, reject) => {
      this.getCount(function (err, data) {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }

  /**
   * Get paginated items
   * @param {Number} limit
   * @param {Number} page
   * @param {Function} cb
   * @public
   */
  getPaginated (limit, page, cb) {
    if (!limit) throw new Error ('Limit is required')
    if (!page) page = 1
    const offset = limit * (page - 1)
    const countBuilder = Object.create(this)
    countBuilder._offsetStr = ''
    countBuilder._limitStr = ''
    countBuilder.getCount((err, count) => {
      if (err) return cb(err)
      this.offset(offset)
      this.limit(limit)
      this.get((err, data) => {
        if (err) return cb(err)
        cb(
          err,
          new Paginator({
            count: count,
            limit: limit,
            current: page,
            items: data
          })
        )
      })
    })
  }

  /**
   * Get paginated items
   * @param {Number} limit
   * @param {Number} page
   * @public
   * @async
   */
  getPaginatedAsync (limit, page) {
    return new Promise((resolve, reject) => {
      this.getPaginated(limit, page, function (err, data) {
        if (err) return reject(err)
        resolve(data)
      })
    })
  }
}

// export dependencies
module.exports = Query
