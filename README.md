mysqlb
========

## Environments

- node.js (>=8)

## Usage

The simple mysql query builder. The library includes a set of simple methods for quickly constructing queries to the database. Syntax is similar to laravel query builder.

### Get started
Create connection and new query builder instance
```javascript
  const Builder = require('mysqlb')
  // create new Builder instance
  const builder = new Builder({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: 'root',
    database: 'test'
  })
```
The connection will be established automatically before first query execution. To force closing connection, use:

```javascript
  builder.closeConnection(function (err) {
    // connection is closed
  })
```
### Insert syntax
```javascript
  const users = builder.use('users')
  users.create({
    name: 'John',
    email: 'john.doe@example.com'
  },
  false, // update on duplicate keys
  function (err, data) {
    // item is created
  })
```
### Update syntax
```javascript
  const users = builder.use('users')
  users.where('id', '=', 4)
  users.update({
    name: 'Johny',
    email: 'johny.doe@example.com'
  },
  function (err, data) {
    // item is updated
  })
```
### Delete syntax
```javascript
  const users = builder.use('users')
  users.where('id', '=', 4)
  users.delete(function (err, data) {
    // item is deleted
  })
```
### Where conditions
```javascript
  const users = builder.use('users')
  // WHERE id
  users.where('id', '=', 4)
  // WHERE id IN
  users.whereIn('id', [1, 3, 5, 9])
  // WHERE name LIKE
  users.like('name', '%ohn%')
  // raw WHERE
  user.whereRaw('id=?', [4])
```
### Join tables
```javascript
  const users = builder.use('users')
  // LEFT JOIN
  users.leftJoin('professions', 'profession_id', 'id')
  // RIGHT JOIN
  users.rightJoin('professions', 'profession_id', 'id')
  // INNER JOIN
  users.innerJoin('professions', 'profession_id', 'id')
```
### Select custom fields
```javascript
  const users = builder.use('users')
  // LEFT JOIN
  users.leftJoin('professions', 'profession_id', 'id')
  users.only(['users.*', 'professions.name as profession_name'])
```
### Get count
```javascript
  const users = builder.use('users')
  users.getCount(function (err, count) {
    // count
  })
```
### Get first element
```javascript
  const users = builder.use('users')
  users.getFirst(function (err, item) {
    // first item
  })
```
### Find item by id
```javascript
  const users = builder.use('users')
  users.find(4, function (err, item) {
    // item
  })
```
### Get items
```javascript
  const users = builder.use('users')
  users.get(function (err, items) {
    // items
  })
```
### Order
```javascript
  const users = builder.use('users')
  users.orderBy('id', 'desc')
```
### Limit, offset
```javascript
  const users = builder.use('users')
  users.limit(9).offset(2)
```
### Paginator
```javascript
  const users = builder.use('users')
  users.getPaginated(
    9, // items per page
    1, // page number
    function (err, paginator) {
      paginator.getItems() // get data from db
      paginator.getCountInPage() // count items per page
      paginator.getTotalPages() // count of pages
      paginator.getLastPage() // last page number
      paginator.getFirstPage() // first page number
      paginator.getPrevPage() // previous page number
      paginator.getNextPage() // next page number
      paginator.getCurrentPage() // current page number
    }
  )
```
### Async methods
You can call all available methods as asycn. Just add 'async' to the end of your methods name.

Example:
```javascript
  const users = builder.use('users')
  users.get(function (err, items) {
    // items
  })
```

Async example:
```javascript
  const users = builder.use('users')
  const items = users.getAsync()
```