/**
 * Select Builder
 */
'use strict'

/**
 * Building select query.
 * @class
 */
class Paginator {
  /**
   * Select builder constructor.
   * @param {Object} builder
   * @param {String} table
   */
  constructor (data) {
    this._setData(data)
  }

  /**
   * Set service data.
   * @param {Object} data
   * @private
   */
  _setData (data) {
    this._count = data.count
    this._limit = data.limit
    this._current = data.current
    this._items = data.items
  }

  /**
   * Get count items in page.
   * @public
   */
  getCountInPage () {
    return this._limit
  }

  /**
   * Get count of pages.
   * @public
   */
  getTotalPages () {
    return Math.ceil(this._count / this._limit)
  }

  /**
   * Get first page number.
   * @public
   */
  getFirstPage () {
    return 1
  }

  /**
   * Get last page number.
   * @public
   */
  getLastPage () {
    return this.getTotalPages()
  }

  /**
   * Get items from db.
   * @public
   */
  getItems () {
    return this._items
  }

  /**
   * Get current page number.
   * @public
   */
  getCurrentPage () {
    return this._current
  }

  /**
   * Get previous page number
   */
  getPrevPage () {
    const currentPage = this.getCurrentPage()
    if (currentPage > 1) {
      return currentPage - 1
    }
    return null
  }

  /**
   * Get next page number
   */
  getNextPage () {
    const currentPage = this.getCurrentPage()
    const totalPages = this.getTotalPages()
    if (currentPage < totalPages) {
      return currentPage + 1
    }
    return null
  }
}

// export dependencies
module.exports = Paginator
