const getCsv = require('./lib/get-csv')
const splitRows = require('./lib/split-rows')
const splitColumns = require('./lib/split-columns')
const MissingCsvError = require('./lib/error/missing-csv.error')
const UnsupportedInputError = require('./lib/error/unsupported-input.error')

function withParsedStatusCode() {
    return ([originalUrl, statusCode, newUrl]) => ([
        originalUrl, parseInt(statusCode, 10), newUrl
    ])
}

function withOriginalAsKey() {
    return ((rules, [originalUrl, statusCode, newUrl]) => ({
        ...rules, [originalUrl]: [statusCode, newUrl]
    }))
}

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
        .map(withParsedStatusCode())
        .reduce(withOriginalAsKey(), {})

    function csvRedirectMiddlewareHandler(req, res, next) {
        const matched = parsed[req.url]
        if (matched) {
            const [statusCode, newUrl] = matched;
            if (statusCode && newUrl) {
                return res.redirect(statusCode, newUrl)
            }
            res.status(statusCode)
            return res.send()
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
