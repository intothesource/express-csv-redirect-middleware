const UnsupportedInputError = require('./error/unsupported-input.error')

function getCsv() {
    return (str) => {
        if (typeof str === 'string') {
            return str;
        }
        if (Buffer.isBuffer(str)) {
            return str.toString('utf8');
        }
        throw new UnsupportedInputError()
    }
}

module.exports = getCsv
