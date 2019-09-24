# express-csv-redirect-middleware

ExpressJS Middleware that handles redirects from a CSV file

## Example

`foo.csv`:

```csv
/foo/	307	/bar/
/foo/	307 /
/foo/	410
```

`server.js`:

```js
import { readFileSync } from 'fs'
import { join } from 'path'
import express from 'express'
import csvRedirectMiddleware from '@intothesource/csv-redirect-middleware'

const csv = readFileSync(join(__dirname, 'foo.csv'))
const app = express()
app.use(csvRedirectMiddleware(csv))
```
