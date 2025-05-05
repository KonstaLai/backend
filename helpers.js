const moment = require('moment');

module.exports = {
  formatDate: function(date, format) {
    try {
      if (!date) return 'N/A';

      if (typeof date === 'string') {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) return 'Invalid Date';
        date = parsedDate;
      }

      if (date instanceof Date || moment.isMoment(date)) {
        const momentDate = moment(date);
        if (!momentDate.isValid()) return 'Invalid Date';

        const defaultFormat = 'MMM D, YYYY h:mm a';
        return momentDate.format(typeof format === 'string' ? format : defaultFormat);
      }

      if (typeof date === 'number') {
        return moment.unix(date).format(typeof format === 'string' ? format : 'MMM D, YYYY h:mm a');
      }

      return 'Invalid Date';
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date Error';
    }
  },

  isAdmin: function(user) {
    return user && user.role === 'admin';
  },

  currentYear: function() {
    return new Date().getFullYear();
  },

  truncate: function(str, len) {
    if (typeof str !== 'string' || str.length <= len) return str;
    return str.substring(0, len) + '...';
  },

  eq: function(a, b) {
    return a === b;
  }
};
