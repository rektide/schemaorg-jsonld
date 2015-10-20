var
  fetch= require( "isomorphic-fetch"),
  fs= require( "fs-promise"),
  gulp= require( "gulp"),
  gutil= require( "gulp-util"),
  jsonld= require( "jsonld"),
  rdfa= require( "jsonld-request/lib/rdfa"),
  jsdom= require( "jsdom"),
  util= require( "util")

function promiseCb(resolve, reject){
	return function(err, data){
		if( err) reject(err)
		resolve(data)
	}
}

function sourceFile(){
	var
	  file= process.argv[ 2]|| process.env[ "SCHEMAORG_RDFA"]|| "schema.rdfa",
	  branch= process.env[ "SCHEMAORG_BRANCH"]|| "master" // "sdo-phobos",
	  url= "https://raw.githubusercontent.com/schemaorg/schemaorg/"+ branch+ "/data/schema.rdfa"
	gutil.log( "Using file '"+ file+ "' to source schema")
	return fs
		.readFile( "./"+ file, "utf8")
		.catch( function(){
			gutil.log( "Fetching from '"+ url+ "'")
			return fetch( "https://raw.githubusercontent.com/schemaorg/schemaorg/"+ branch+ "/data/schema.rdfa").then( function( response){
				if( response.status >= 400){
					throw new Error( "Incorrect response from Github:", response.status)
				}
				return response.text().then( function( text){
					gutil.log( "Saving into file")
					return fs.writeFile( "./"+ file, text).then(function(){
						return text
					})
				})
			})
		})
}

function xmlParse( source){
	return new Promise( function( resolve, reject){
		gutil.log( "Parsing with jsdom")
		jsdom.env({
			url: "file:///schema.rdfa",
			html: source,
			done: promiseCb( resolve, reject)
		})
	})
}

function getDoc( win){
	return win.document
}

function extractJsonLd( doc){
	return new Promise( function( resolve, reject){
		gutil.log( "Extracting json-ld")
		// extract JSON-LD from RDFa
		// https://github.com/digitalbazaar/jsonld-request/commit/b75e066e9bd68988f544eba6a961cebd7301cac6#diff-96d9811cb2296e877edf463c6cfc57bdR118
		rdfa.attach(doc);
		jsonld.fromRDF(doc.data, {format: 'rdfa-api'}, promiseCb( resolve, reject))
	})
}

function saveJsonLd( val){
	gutil.log( "Saving schema.json")
	return fs.writeFile( "./schema.json", JSON.stringify( val))
}

function print( val){
	gutil.log( val)
}

function run(){
	return sourceFile().then( xmlParse).then( getDoc).then( extractJsonLd).then( saveJsonLd)
}

gulp.task( "source", sourceFile)
gulp.task( "default", run)

module.exports= run
module.exports.run= run
module.exports.sourceFile= sourceFile
module.exports.jsonld= jsonld
module.exports.xmlParse= xmlParse
module.exports.getDoc= getDoc
module.exports.extractJsonLd= extractJsonLd
module.exports.saveJsonLd= saveJsonLd
