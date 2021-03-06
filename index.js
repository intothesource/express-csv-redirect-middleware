const getCsv = require('./lib/get-csv')
const splitRows = require('./lib/split-rows')
const splitColumns = require('./lib/split-columns')
const withParsedStatusCode = require('./lib/with-parsed-status-code')
const withOriginalAsKey = require('./lib/with-original-as-key')

// Errors
const MissingCsvError = require('./lib/error/missing-csv.error')
const UnsupportedInputError = require('./lib/error/unsupported-input.error')

/**
 * @param {string} csv 
 */
function csvRedirect(csv) {

    if (csv == null) {
        throw new MissingCsvError()
    }

    const csvData = getCsv()(csv)

    const lf = '\n'
    const sep = '\t'

    const parsed = splitRows(lf)(csvData)
        .map(splitColumns(sep))
        .filter(([source, , target]) => target !== source)
        .map(withParsedStatusCode())
        .reduce(withOriginalAsKey(), {})

    function csvRedirectMiddlewareHandler(req, res, next) {
        const matched = parsed[req.url]
        if (matched && (matched[0] || matched[1])) {
            const [statusCode, newUrl] = matched;
            if (newUrl) {
                return res.redirect(statusCode, newUrl)
            } else if (!newUrl && statusCode) {
                res.status(statusCode)
                return res.send()
            }
        }
        next()
    }

    csvRedirectMiddlewareHandler.csv = csvData
    csvRedirectMiddlewareHandler.parsed = parsed

    return csvRedirectMiddlewareHandler
}

csvRedirect.MissingCsvError = MissingCsvError
csvRedirect.UnsupportedInputError = UnsupportedInputError

module.exports = csvRedirect
