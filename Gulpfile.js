var
  gulp= require( "gulp"),
  fetch= require( "isomorphic-fetch"),
  fs= require( "fs-promise")


function sourceFile(){
	var
	  file= process.argv[ 1]|| process.env[ "SCHEMAORG_RDFA"]|| "schema.rdfa",
	  branch= process.env[ "SCHEMAORG_BRANCH"]
	return fs
		.readFile( "./"+ file)
		.catch( function(){
			return fetch( "https://raw.githubusercontent.com/schemaorg/schemaorg/sdo-phobos/data/schema.rdfa").then( function( response){
				if( response.status >= 400){
					throw new Error( "Incorrect response from Github:", response.status)
				}
				var text= response.text()
				return fs.writeFile( "./"+ file, text).then(function(){ return text})
			})
		})
}

function jsonld(){
	sourceFile.then( function(source){
	})
}

gulp.task( "source", sourceFile)
gulp.task( "jsonld", jsonld)
gulp task( "default", ["jsonld"])
module.exports.sourceFile= sourceFile
module.exports.jsonld= jsonld
