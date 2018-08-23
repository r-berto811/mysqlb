const mysql = require('mysql')
const dotenv = require('dotenv').config()

module.exports = {

  _getConnection () {
    return mysql.createConnection({
      host     : process.env.DB_HOST ? process.env.DB_HOST : 'localhost',
      user     : process.env.DB_USER ? process.env.DB_USER : 'root',
      password : process.env.DB_PASSWORD ? process.env.DB_PASSWORD : 'root',
      port     : process.env.DB_PORT ? process.env.DB_PORT : 3306,
      multipleStatements: true
    })
  },

  getConnectionConfig () {
    return {
      database: 'mysqlb_test',
      host     : process.env.DB_HOST ? process.env.DB_HOST : 'localhost',
      user     : process.env.DB_USER ? process.env.DB_USER : 'root',
      password : process.env.DB_PASSWORD ? process.env.DB_PASSWORD : 'root',
      port     : process.env.DB_PORT ? process.env.DB_PORT : 3306,
    }
  },
  create (cb) {
    const connection = this._getConnection()
    const sql = 
      ' DROP DATABASE IF EXISTS mysqlb_test;' +
      ' CREATE DATABASE `mysqlb_test`;' +
      ' USE `mysqlb_test`;' +
      ' CREATE TABLE `mysqlb_test`.`users` ( `id` INT NOT NULL AUTO_INCREMENT , `f_name` VARCHAR(255) NULL DEFAULT NULL , `l_name` VARCHAR(255) NULL DEFAULT NULL , `age` INT NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;' +
        ' INSERT INTO `users` (`f_name`, `l_name`, `age`) VALUES ("Hohn", "Snow", "25");' +
        ' INSERT INTO `users` (`f_name`, `l_name`, `age`) VALUES ("Peter", "Jeneson", "23");' +
        ' INSERT INTO `users` (`f_name`, `l_name`, `age`) VALUES ("Olivia", "Clarke", "23");' +
        ' INSERT INTO `users` (`f_name`, `l_name`, `age`) VALUES ("Julia", "Rose", "23");' +
        ' INSERT INTO `users` (`f_name`, `l_name`, `age`) VALUES ("Irene", "Williams", "23");' +
      ' CREATE TABLE `mysqlb_test`.`professions` ( `id` INT NOT NULL AUTO_INCREMENT, `user_id` INT NOT NULL , `name` VARCHAR(255) NULL DEFAULT NULL, PRIMARY KEY (`id`), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, UNIQUE(user_id) ) ENGINE = InnoDB;' +
        ' INSERT INTO `professions` (`user_id`, `name`) VALUES ("1", "engineer");' +
        ' INSERT INTO `professions` (`user_id`, `name`) VALUES ("2", "builder");' +
        ' INSERT INTO `professions` (`user_id`, `name`) VALUES ("3", "lawyer");' +
        ' INSERT INTO `professions` (`user_id`, `name`) VALUES ("4", "teacher");' +
        ' INSERT INTO `professions` (`user_id`, `name`) VALUES ("5", "cook");'
    
    connection.connect(function (err) {
      if (err) return console.log(err)
      connection.query(sql, function (err, results, fields) {
        if (err) return console.log(err)
        connection.end(function (err) {
          if (err) return console.log(err)
          cb()
        })
      })
    })
    
  },

  remove (cb) {
    const connection = this._getConnection()
    const sql = ' DROP DATABASE mysqlb_test;'
    connection.connect(function (err) {
      if (err) return console.log(err)
      connection.query(sql, function (err, results, fields) {
        if (err) return console.log(err)
        connection.end(function (err) {
          if (err) return console.log(err)
          cb()
        })
      })
    })
  },

  test (done, cb) {
    const self = this
    this.create(function () {
      cb(function () {
        self.remove(function () {
          console.log('done')
          done()
        })
      })
    })
  }

}
