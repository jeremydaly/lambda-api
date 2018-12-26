'use strict';

const expect = require('chai').expect // Assertion library

const utils = require('../lib/utils')

/******************************************************************************/
/***  BEGIN TESTS                                                           ***/
/******************************************************************************/

describe('Utility Function Tests:', function() {

  describe('escapeHtml:', function() {

    it('Escape &, <, >, ", and \'', function() {
      expect(utils.escapeHtml('&<>"\'')).to.equal('&amp;&lt;&gt;&quot;&#39;')
    }) // end it

  }) // end escapeHtml tests

  describe('encodeUrl:', function() {

    it('Unencoded with space in param', function() {
      expect(utils.encodeUrl('http://www.github.com/?foo=bar with space')).to.equal('http://www.github.com/?foo=bar%20with%20space')
    }) // end it

    it('Encoded URL with additional invalid sequence', function() {
      expect(utils.encodeUrl('http://www.github.com/?foo=bar%20with%20space%foo')).to.equal('http://www.github.com/?foo=bar%20with%20space%25foo')
    }) // end it

    it('Encode special characters, double encode, decode', function() {
      let url = 'http://www.github.com/?foo=шеллы'
      let encoded = utils.encodeUrl(url)
      let doubleEncoded = utils.encodeUrl(encoded)
      let decoded = decodeURI(encoded)
      expect(encoded).to.equal('http://www.github.com/?foo=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B')
      expect(doubleEncoded).to.equal('http://www.github.com/?foo=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B')
      expect(decoded).to.equal(url)
    }) // end it

  }) // end encodeUrl tests


  describe('encodeBody:', function() {

    it('String', function() {
      expect(utils.encodeBody('test string')).to.equal('test string')
    }) // end it

    it('Number', function() {
      expect(utils.encodeBody(123)).to.equal('123')
    }) // end it

    it('Array', function() {
      expect(utils.encodeBody([1,2,3])).to.equal('[1,2,3]')
    }) // end it

    it('Object', function() {
      expect(utils.encodeBody({ foo: 'bar' })).to.equal('{"foo":"bar"}')
    }) // end it

  }) // end encodeBody tests


  describe('parseBody:', function() {

    it('String', function() {
      expect(utils.parseBody('test string')).to.equal('test string')
    }) // end it

    it('Number', function() {
      expect(utils.parseBody('123')).to.equal(123)
    }) // end it

    it('Array', function() {
      expect(utils.parseBody('[1,2,3]')).to.deep.equal([ 1, 2, 3 ])
    }) // end it

    it('Object', function() {
      expect(utils.parseBody('{"foo":"bar"}')).to.deep.equal({ foo: 'bar' })
    }) // end it

  }) // end encodeBody tests


  describe('parseAuth:', function() {

    it('None: undefined', function() {
      let result = utils.parseAuth(undefined)
      expect(result).to.deep.equal({ type: 'none', value: null })
    }) // end it

    it('None: empty', function() {
      let result = utils.parseAuth('')
      expect(result).to.deep.equal({ type: 'none', value: null })
    }) // end it

    it('Invalid schema', function() {
      let result = utils.parseAuth('Test 12345')
      expect(result).to.deep.equal({ type: 'none', value: null })
    }) // end it

    it('Missing value/token', function() {
      let result = utils.parseAuth('Bearer')
      expect(result).to.deep.equal({ type: 'none', value: null })
    }) // end it

    it('Bearer Token (OAuth2/JWT)', function() {
      let result = utils.parseAuth('Bearer XYZ')
      expect(result).to.deep.equal({ type: 'Bearer', value: 'XYZ' })
    }) // end it

    it('Digest', function() {
      let result = utils.parseAuth('Digest XYZ')
      expect(result).to.deep.equal({ type: 'Digest', value: 'XYZ' })
    }) // end it

    it('OAuth 1.0', function() {
      let result = utils.parseAuth('OAuth realm="Example", oauth_consumer_key="xyz", oauth_token="abc", oauth_version="1.0"')
      expect(result).to.deep.equal({
        type: 'OAuth',
        value: 'realm="Example", oauth_consumer_key="xyz", oauth_token="abc", oauth_version="1.0"',
        realm: 'Example',
        oauth_consumer_key: 'xyz',
        oauth_token: 'abc',
        oauth_version: '1.0'
      })
    }) // end it

    it('Basic', function() {
      let creds = new Buffer('test:testing').toString('base64')
      let result = utils.parseAuth('Basic ' + creds)
      expect(result).to.deep.equal({ type: 'Basic', value: creds, username: 'test', password: 'testing' })
    }) // end it

    it('Basic (no password)', function() {
      let creds = new Buffer('test').toString('base64')
      let result = utils.parseAuth('Basic ' + creds)
      expect(result).to.deep.equal({ type: 'Basic', value: creds, username: 'test', password: null })
    }) // end it

    it('Invalid type', function() {
      let result = utils.parseAuth(123)
      expect(result).to.deep.equal({ type: 'none', value: null })
    }) // end it

  }) // end encodeBody tests


  describe('mimeLookup:', function() {

    it('.pdf', function() {
      expect(utils.mimeLookup('.pdf')).to.equal('application/pdf')
    }) // end it

    it('application/pdf', function() {
      expect(utils.mimeLookup('application/pdf')).to.equal('application/pdf')
    }) // end it

    it('application-x/pdf (non-standard w/ slash)', function() {
      expect(utils.mimeLookup('application-x/pdf')).to.equal('application-x/pdf')
    }) // end it

    it('xml', function() {
      expect(utils.mimeLookup('xml')).to.equal('application/xml')
    }) // end it

    it('.html', function() {
      expect(utils.mimeLookup('.html')).to.equal('text/html')
    }) // end it

    it('css', function() {
      expect(utils.mimeLookup('css')).to.equal('text/css')
    }) // end it

    it('jpg', function() {
      expect(utils.mimeLookup('jpg')).to.equal('image/jpeg')
    }) // end it

    it('.svg', function() {
      expect(utils.mimeLookup('.svg')).to.equal('image/svg+xml')
    }) // end it

    it('docx', function() {
      expect(utils.mimeLookup('docx')).to.equal('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    }) // end it

    it('Custom', function() {
      expect(utils.mimeLookup('.mpeg', { mpeg: 'video/mpeg' })).to.equal('video/mpeg')
    }) // end it

  }) // end encodeBody tests


  describe('statusLookup:', function() {

    it('200', function() {
      expect(utils.statusLookup(200)).to.equal('OK')
    }) // end it

    it('201', function() {
      expect(utils.statusLookup(201)).to.equal('Created')
    }) // end it

    it('304', function() {
      expect(utils.statusLookup(304)).to.equal('Not Modified')
    }) // end it

    it('404', function() {
      expect(utils.statusLookup(404)).to.equal('Not Found')
    }) // end it

    it('502', function() {
      expect(utils.statusLookup(502)).to.equal('Bad Gateway')
    }) // end it

    it('999 Uknown', function() {
      expect(utils.statusLookup(999)).to.equal('Unknown')
    }) // end it

    it('As string (parsable as int)', function() {
      expect(utils.statusLookup('200')).to.equal('OK')
    }) // end it

    it('As string (not parsable as int)', function() {
      expect(utils.statusLookup('foo')).to.equal('Unknown')
    }) // end it

  }) // end encodeBody tests


  describe('extractRoutes:', function() {

    it('Sample routes', function() {
      // Create an api instance
      let api = require('../index')()
      api.get('/', (req,res) => {})
      api.post('/test', (req,res) => {})
      api.put('/test/put', (req,res) => {})
      api.delete('/test/:var/delete', (req,res) => {})

      expect(utils.extractRoutes(api._routes)).to.deep.equal([
        [ 'GET', '/' ],
        [ 'POST', '/test' ],
        [ 'PUT', '/test/put' ],
        [ 'DELETE', '/test/:var/delete' ]
      ])
    }) // end it

    it('No routes', function() {
      // Create an api instance
      let api = require('../index')()

      expect(utils.extractRoutes(api._routes)).to.deep.equal([])
    }) // end it

    it('Prefixed routes', function() {
      // Create an api instance
      let api = require('../index')()

      api.register((apix,opts) => {
        apix.get('/', (req,res) => {})
        apix.post('/test', (req,res) => {})
      }, { prefix: '/v1' })
      api.get('/', (req,res) => {})
      api.post('/test', (req,res) => {})
      api.put('/test/put', (req,res) => {})
      api.delete('/test/:var/delete', (req,res) => {})

      expect(utils.extractRoutes(api._routes)).to.deep.equal([
        [ 'GET', '/v1' ],
        [ 'POST', '/v1/test' ],
        [ 'GET', '/' ],
        [ 'POST', '/test' ],
        [ 'PUT', '/test/put' ],
        [ 'DELETE', '/test/:var/delete' ]
      ])
    }) // end it

    it('Base routes', function() {
      // Create an api instance
      let api = require('../index')({ base: 'v2' })
      api.get('/', (req,res) => {})
      api.post('/test', (req,res) => {})
      api.put('/test/put', (req,res) => {})
      api.delete('/test/:var/delete', (req,res) => {})

      expect(utils.extractRoutes(api._routes)).to.deep.equal([
        [ 'GET', '/v2' ],
        [ 'POST', '/v2/test' ],
        [ 'PUT', '/v2/test/put' ],
        [ 'DELETE', '/v2/test/:var/delete' ]
      ])
    }) // end it

  }) // end extractRoutes


  describe('generateEtag:', function() {

    it('Sample text', function() {
      expect(utils.generateEtag('this is a test string')).to.equal('f6774519d1c7a3389ef327e9c04766b9')
    }) // end it

    it('Sample object', function() {
      expect(utils.generateEtag({ test: true, foo: 'bar' })).to.equal('def7648849c1e7f30c9a9c0ac79e4e52')
    }) // end it

    it('Sample JSON string object', function() {
      expect(utils.generateEtag(JSON.stringify({ test: true, foo: 'bar' }))).to.equal('def7648849c1e7f30c9a9c0ac79e4e52')
    }) // end it

    it('Sample buffer', function() {
      expect(utils.generateEtag(Buffer.from('this is a test string as a buffer'))).to.equal('6a2f7473a72cfebc96ae8cf93d643b70')
    }) // end it

    it('Long string', function() {
      let longString = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
      expect(utils.generateEtag(longString)).to.equal('2d8c2f6d978ca21712b5f6de36c9d31f')
    }) // end it

    it('Long string (minor variant)', function() {
      let longString = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est Laborum.'
      expect(utils.generateEtag(longString)).to.equal('bc82a4065a8ab48ade900c6466b19ccd')
    }) // end it

  }) // end generateEtag tests


  describe('isS3:', function() {
    it('Empty path', function() {
      expect(utils.isS3('')).to.be.false
    })

    it('Valid S3 path', function() {
      expect(utils.isS3('s3://test-bucket/key')).to.be.true
    })

    it('Valid S3 path (uppercase)', function() {
      expect(utils.isS3('S3://test-bucket/key')).to.be.true
    })

    it('Invalid S3 path', function() {
      expect(utils.isS3('s3://test-bucket')).to.be.false
    })

    it('Empty S3 path', function() {
      expect(utils.isS3('s3:///')).to.be.false
    })

    it('URL', function() {
      expect(utils.isS3('https://somedomain.com/test')).to.be.false
    })

    it('Relative path', function() {
      expect(utils.isS3('../test/file.txt')).to.be.false
    })
  }) // end isS3 tests


  describe('parseS3:', function() {
    it('Valid S3 path', function() {
      expect(utils.parseS3('s3://test-bucket/key')).to.deep.equal({ Bucket: 'test-bucket', Key: 'key' })
    })

    it('Valid S3 path (nested key)', function() {
      expect(utils.parseS3('s3://test-bucket/key/path/file.txt')).to.deep.equal({ Bucket: 'test-bucket', Key: 'key/path/file.txt' })
    })

    it('Invalid S3 path (no key)', function() {
      let func = () => utils.parseS3('s3://test-bucket')
      expect(func).to.throw('Invalid S3 path')
    })

    it('Invalid S3 path (no bucket or key)', function() {
      let func = () => utils.parseS3('s3://')
      expect(func).to.throw('Invalid S3 path')
    })

    it('Invalid S3 path (empty)', function() {
      let func = () => utils.parseS3('')
      expect(func).to.throw('Invalid S3 path')
    })

  }) // end parseS3 tests

}) // end UTILITY tests
