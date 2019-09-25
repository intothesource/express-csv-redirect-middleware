function statusCodeFromString(val = '') {
    if (val === '') return null
    const num = parseInt(val, 10)
    if (isNaN(num)) throw new Error('Status Code is not a number: ' + val)
    else if (num < 100) throw new Error('Status Code out of bounds: ' + val)
    else if (num > 599) throw new Error('Status Code out of bounds: ' + val)
    return num
}

module.exports = statusCodeFromString
