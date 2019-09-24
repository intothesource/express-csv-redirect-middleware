import test from 'ava'
import { readFileSync } from 'fs'
import { join } from 'path'
import express from 'express'
import request from 'supertest'
import mw from '.'
import UnsupportedInputError from './lib/error/unsupported-input.error'
import MissingCsvError from './lib/error/missing-csv.error'

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
