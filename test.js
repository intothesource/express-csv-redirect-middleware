import test from 'ava'
import { readFileSync } from 'fs'
import { join } from 'path'
import express from 'express'
import request from 'supertest'
import mw from '.'
import UnsupportedInputError from './lib/error/unsupported-input.error'
import MissingCsvError from './lib/error/missing-csv.error'

import statusCodeFromString from './lib/status-code-from-string'
import withParsedStatusCode from './lib/with-parsed-status-code'

// ---
// Library
// ---

test.serial('lib/status-code-from-string with status code', t => {
	t.is(typeof statusCodeFromString('307'), 'number')
})

test.serial('lib/status-code-from-string without status code should be null', t => {
	t.is(statusCodeFromString(''), null)
})

test.serial('lib/status-code-from-string with string should throw', t => {
	t.throws(() => statusCodeFromString('/foo/'), 'Status Code is not a number: /foo/')
})

test.serial('lib/status-code-from-string with status code <100 should throw', t => {
	t.throws(() => statusCodeFromString('99'), 'Status Code out of bounds: 99')
})

test.serial('lib/status-code-from-string with status code >599 should throw', t => {
	t.throws(() => statusCodeFromString('600'), 'Status Code out of bounds: 600')
})

// 
// lib/with-parsed-status-code
// 

test.serial('lib/with-parsed-status-code with status code', t => {
	const [entry] = [['', '307', '']].map(withParsedStatusCode())
	const [, statusCode] = entry
	t.is(typeof statusCode, 'number')
})

test.serial('lib/with-parsed-status-code without status code should be null', t => {
	const [entry] = [['', '', '']].map(withParsedStatusCode())
	const [, statusCode] = entry
	t.is(statusCode, null)
})

test.serial('lib/with-parsed-status-code with string should throw', t => {
	t.throws(() => [['', '/foo/', '']].map(withParsedStatusCode()),
		'Error while parsing [, /foo/, ]: Status Code is not a number: /foo/')
})

test.serial('lib/with-parsed-status-code with status code <100 should throw', t => {
	t.throws(() => [['', '99', '']].map(withParsedStatusCode()),
		'Error while parsing [, 99, ]: Status Code out of bounds: 99')
})

test.serial('lib/with-parsed-status-code with status code >599 should throw', t => {
	t.throws(() => [['', '600', '']].map(withParsedStatusCode()),
		'Error while parsing [, 600, ]: Status Code out of bounds: 600')
})

// ---
// Middleware function
// ---

test.serial('throw error if missing csv arg', async t => {
	t.throws(() => mw(), MissingCsvError)
})

test.serial('throw error if nulled csv arg', async t => {
	t.throws(() => mw(null), MissingCsvError)
})

test.serial('throw error if undefined csv arg', async t => {
	t.throws(() => mw(undefined), MissingCsvError)
})

test.serial('throw error if csv is a not string or Buffer', async t => {
	t.throws(() => mw([]), UnsupportedInputError)
	t.throws(() => mw({}), UnsupportedInputError)
	t.throws(() => mw(true), UnsupportedInputError)
	t.throws(() => mw(false), UnsupportedInputError)
})

test.serial('should be ok when string is empty', async t => {
	const middleware = mw('')
	t.is(middleware.csv, '')
})

test.serial.skip('should not create rule for empty string', async t => {
	const middleware = mw('')
	t.is(middleware.parsed[''], undefined)
})

test.serial('accept plain string', async t => {
	const middleware = mw('/foo/\t307\t/bar/')
	t.is(middleware.csv, '/foo/\t307\t/bar/')
})

test.serial('accept string from fs', async t => {
	const csv = readFileSync(join(__dirname, 'test/example-1.csv'), { encoding: 'utf8' })
	const middleware = mw(csv)
	t.is(middleware.csv, '/foo/\t307\t/bar/\n')
})

test.serial('accept plain Buffer', async t => {
	const middleware = mw(Buffer.from('/foo/\t307\t/bar/'))
	t.is(middleware.csv, '/foo/\t307\t/bar/')
})

test.serial('accept Buffer from fs', async t => {
	const csv = readFileSync(join(__dirname, 'test/example-1.csv'))
	const middleware = mw(csv)
	t.is(middleware.csv, '/foo/\t307\t/bar/\n')
})

test.serial('parse original url', async t => {
	const middleware = mw('/foo/\t307\t/bar/')
	t.truthy(middleware.parsed['/foo/'])
})

test.serial('parse status code as number', async t => {
	const middleware = mw('/foo/\t307\t/bar/')
	t.is(middleware.parsed['/foo/'][0], 307)
})

test.serial('parse target url', async t => {
	const middleware = mw('/foo/\t307\t/bar/')
	t.is(middleware.parsed['/foo/'][1], '/bar/')
})

// ---
// Express
// ---

test.serial('express sanity check', async t => {
	const app = express()
	const res = await request(app).get('/')
	t.is(res.statusCode, 404)
})

test.serial('get any uri and safely pass-through', async t => {
	const app = express().use(mw(''))
	const res = await request(app).get('/')
	t.is(res.statusCode, 404)
})

test.serial('redirect /foo/ 307 /bar/', async t => {
	const app = express().use(mw('/foo/\t307\t/bar/'))
	const res = await request(app).get('/foo/')
	t.is(res.statusCode, 307)
	t.is(res.headers.location, '/bar/')
})

test.serial('redirect /foo/ 307 /', async t => {
	const app = express().use(mw('/foo/\t307\t/'))
	const res = await request(app).get('/foo/')
	t.is(res.statusCode, 307)
	t.is(res.headers.location, '/')
})

test.serial('return 410 for /foo/ 410', async t => {
	const app = express().use(mw('/foo/\t410'))
	const res = await request(app).get('/foo/')
	t.is(res.statusCode, 410)
	t.is(res.headers.location, undefined)
})

test.serial('return 404 for /foo/ 404', async t => {
	const app = express().use(mw('/foo/\t404'))
	const res = await request(app).get('/foo/')
	t.is(res.statusCode, 404)
	t.is(res.headers.location, undefined)
})
