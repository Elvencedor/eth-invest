import moment from 'moment'
import copy from 'copy-to-clipboard'
import izitoast from 'izitoast'

const mixin = {
  methods: {
    formatDate (date) {
      return moment(date).format('YYYY-MM-DD hh:mma')
    },

    truncate (str, length = 10) {
      const newStr = str.slice(0, length)
      return newStr + '...'
    },

    copyToClipboard (str) {
      const isCopy = copy(str, { debug: true, message: 'Press #{key} to copy' })

      if (isCopy) {
        izitoast.success({
          title: 'Copied',
          message: 'Copied to clipboard!'
        })
      }
    },

    formatDays (days) {
      // The string we're working with to create the representation
      var str = ''
      // Map lengths of `days` to different time periods
      var values = [[' year', 365], [' month', 30], [' day', 1]]

      // Iterate over the values...
      for (var i = 0; i < values.length; i++) {
        var amount = Math.floor(days / values[i][1])

        // ... and find the largest time value that fits into the days
        if (amount >= 1) {
          // If we match, add to the string ('s' is for pluralization)
          str += amount + values[i][0] + (amount > 1 ? 's' : '') + ' '

          // and subtract from the days
          days -= amount * values[i][1]
        }
      }

      return str
    }
  }
}

export default mixin
