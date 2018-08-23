'use strict'

const assert = require('chai').assert
const builderPath = '../'
const queryPath = '../lib/query'
const paginatorPath = '../lib/paginator'

const db = require('./db')
const connectionOptions = db.getConnectionConfig()

suite('require', () => {
  let log

  setup(() => {
    log = {}
  })

  test('Builder require does not throw', () => {
    assert.doesNotThrow(() => {
      require(builderPath)
    })
  })

  test('Query require does not throw', () => {
    assert.doesNotThrow(() => {
      require(queryPath)
    })
  })

  test('Paginator require does not throw', () => {
    assert.doesNotThrow(() => {
      require(paginatorPath)
    })
  })

  suite('builder:', () => {
    let Builder
    let Query
    let Paginator

    setup(() => {
      Builder = require(builderPath)
      Query = require(queryPath)
      Paginator = require(paginatorPath)
    })

    test('create builder instance does not throw', () => {
      assert.doesNotThrow(() => {
        new Builder(connectionOptions)
      })
    })

    suite('queries:', () => {

      test('test connected function', (done) => {
        db.test(done, function (end) {
          const builder = new Builder(connectionOptions)
          assert.equal(Builder._connection, null, 'first value of connection must be a null')
          builder.connected((err, connection) => {
            assert.notExists(err, 'err must be a null or undefined')
            assert.isObject(connection, 'value of connection in callback must be an object')
            assert.isObject(Builder._connection, 'value of Builder._connection in callback must be an object')
            assert.equal(connection, Builder._connection, 'connection and Builder._connection must be an equal')
            end()
          })
        })
      })

      test('test closeConnection function', (done) => {
        db.test(done, function (end) {
          const builder = new Builder(connectionOptions)
          assert.isObject(Builder._connection, 'first value of connection must be an object')
          builder.closeConnection((err) => {
            assert.notExists(err, 'err must be a null or undefined')
            assert.equal(Builder._connection, null, 'value of connection in callback must be a null')
            end()
          })
        })
      })

      test('test use function', (done) => {
        db.test(done, function (end) {
          const builder = new Builder(connectionOptions)
          const dapps = builder.use('users')
          assert.instanceOf(dapps, Query, 'instance must by type of query')
          assert.equal(dapps._table, 'users', 'table name and instance table must be an equal')
          assert.equal(dapps._builder, builder, 'builder and instance builder must be an equal')
          end()
        })
      })

      test('test query function', (done) => {
        db.test(done, function (end) {
          const builder = new Builder(connectionOptions)
          builder.query('SELECT * FROM users WHERE id>? AND f_name!=?', [2, 'Julia'], (err, data) => {
            assert.notExists(err, 'err must be a null or undefined')
            assert.equal(data.length, 2, 'must be 2 items')
            assert.isArray(data, 'require returns array')
            end()
          })
        })
      })

      suite('create:', () => {

        test('Testing create function without replacing', (done) => {
          db.test(done, function (end) {
            const builder = new Builder(connectionOptions)
            const users = builder.use('users')
            users.create({
              f_name: 'inserted',
              l_name: 'user',
              age: 18
            }, false, (err, data) => {
              assert.notExists(err, 'err must be a null')
              assert.isObject(data, 'data have to be an object')
              assert.equal(data.insertId, 6, 'insert id have to be 6')
              end()
            })
          })
        })

        test('Testing create function with replacing', (done) => {
          db.test(done, function (end) {
            const builder = new Builder(connectionOptions)
            const users = builder.use('professions')
            users.create({
              user_id: 2,
              name: 'lawyer'
            }, true, (err, data) => {
              assert.notExists(err, 'err must be a null')
              assert.isObject(data, 'data have to be an object')
              assert.equal(data.insertId, 2, 'insert id have to be 2')
              end()
            })
          })
        })

      })

      suite('update:', () => {

        test('Testing update function', (done) => {
          db.test(done, function (end) {
            const builder = new Builder(connectionOptions)
            const users = builder.use('users')
            users.where('id', '=', 2)
            users.update({
              f_name: 'inserted',
              'users.l_name': 'user',
              age: 18
            }, (err, data) => {
              assert.notExists(err, 'err must be a null')
              assert.isObject(data, 'data have to be an object')
              assert.equal(data.changedRows, 1, 'query returns changes')
              end()
            })
          })
        })

      })

      suite('select:', () => {

        test('Testing get function', (done) => {
          db.test(done, function (end) {
            const builder = new Builder(connectionOptions)
            const users = builder.use('users')
            users.where('id', '>', 3)
            users.get((err, data) => {
              assert.notExists(err, 'err must be a null')
              assert.isArray(data, 'data have to be an array')
              assert.equal(data.length, 2, 'count items have to be 2')
              assert.equal(data[0]['f_name'], 'Julia', 'first item with f_name have to be a Julia')
              end()
            })
          })
        })

        test('Testing get function with order', (done) => {
          db.test(done, function (end) {
            const builder = new Builder(connectionOptions)
            const users = builder.use('users')
            users.where('id', '>', 3)
            users.orderBy('id', 'desc')
            users.get((err, data) => {
              assert.notExists(err, 'err must be a null')
              assert.isArray(data, 'data have to be an array')
              assert.equal(data.length, 2, 'count items have to be 2')
              assert.equal(data[0]['f_name'], 'Irene', 'first item with f_name have to be a Irene')
              end()
            })
          })
        })

        test('Testing get function with order, limit and offset', (done) => {
          db.test(done, function (end) {
            const builder = new Builder(connectionOptions)
            const users = builder.use('users')
            users.where('id', '>', 2)
            users.orderBy('id', 'desc')
            users.limit(1)
            users.offset(2)
            users.get((err, data) => {
              assert.notExists(err, 'err must be a null')
              assert.isArray(data, 'data have to be an array')
              assert.equal(data.length, 1, 'count items have to be 2')
              assert.equal(data[0]['f_name'], 'Olivia', 'first item with f_name have to be a Olivia')
              end()
            })
          })
        })

        test('Testing getCount function', (done) => {
          db.test(done, function (end) {
            const builder = new Builder(connectionOptions)
            const users = builder.use('users')
            users.where('id', '>', 1)
            users.getCount((err, data) => {
              assert.notExists(err, 'err must be a null')
              assert.isNumber(data, 'data have to be a number')
              assert.equal(data, 4, 'count items have to be 4')
              end()
            })
          })
        })

        test('Testing leftJoin function', (done) => {
          db.test(done, function (end) {
            const builder = new Builder(connectionOptions)
            const users = builder.use('users')
            users.leftJoin('professions', 'id', 'user_id')
            users.where('id', '>', 1)
            users.only(['professions.name as user_prof'])
            users.where('professions.id', '>', 2)
            users.get((err, data) => {
              assert.notExists(err, 'err must be a null')
              assert.isArray(data, 'data have to be an array')
              assert.equal(data.length, 3, 'count items have to be 3')
              assert.equal(data[0]['user_prof'], 'lawyer', 'profession of first element have to be a lawyer')
              end()
            })
          })
        })

        test('Testing getFirst and whereRaw functions', (done) => {
          db.test(done, function (end) {
            const builder = new Builder(connectionOptions)
            const users = builder.use('users')
            users.whereRaw('id > ?', [2])
            users.getFirst((err, data) => {
              assert.notExists(err, 'err must be a null')
              assert.isObject(data, 'data have to be an object')
              assert.equal(data.f_name, 'Olivia', 'f_name have to be Olivia')
              end()
            })
          })
        })

        test('Testing whereIn function', (done) => {
          db.test(done, function (end) {
            const builder = new Builder(connectionOptions)
            const users = builder.use('users')
            users.whereIn('id', [2, 3])
            users.get((err, data) => {
              assert.notExists(err, 'err must be a null')
              assert.isArray(data, 'data have to be an array')
              assert.equal(data.length, 2, 'count of items have to be 2')
              end()
            })
          })
        })
      })

      suite('delete:', () => {
        test('Testing delete function', (done) => {
          db.test(done, function (end) {
            const builder = new Builder(connectionOptions)
            const users = builder.use('users')
            users.where('id', '>', 3)
            users.delete((err, data) => {
              assert.notExists(err, 'err must be a null')
              assert.isObject(data, 'data have to be an object')
              assert.equal(data.affectedRows, 2, 'affected rows have to be 2')
              end()
            })
          })
        })
      })

      suite('paginator:', () => {
        test('Testing getPaginated function', (done) => {
          db.test(done, function (end) {
            const builder = new Builder(connectionOptions)
            const users = builder.use('users')
            users.where('id', '>', 0)
            users.orderBy('id', 'desc')
            users.getPaginated(2, 2, (err, data) => {
              assert.notExists(err, 'err must be a null')
              assert.isObject(data, 'data have to be an object')
              assert.instanceOf(data, Paginator, 'instance must by type of Paginator')
              assert.isArray(data.getItems(), 'items have to be an array')
              assert.equal(data.getItems().length, 2, 'count of items have to be a 2')
              assert.equal(data.getItems().length, 2, 'count of items have to be a 2')
              assert.equal(data.getItems()[0]['f_name'], 'Olivia', 'f_name of first item have to be an Olivia')
              assert.equal(data.getNextPage(), 3, 'next page have to be a 3')
              assert.equal(data.getTotalPages(), 3, 'total pages have to be a 3')
              end()
            })
          })
        })
      })

    })

  })

})
