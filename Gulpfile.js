var
  gulp= require( "gulp"),
  fetch= require( "isomorphic-fetch"),
  fs= require( "fs-promise")

gulp.task( "source", function(){
	var
	  file= process.argv[ 1]|| process.env[ "SCHEMAORG_RDFA"]|| "schema.rdfa",
	  branch= process.env[ "SCHEMAORG_BRANCH"]
	return fs.exists( "./"+ file).then( function(exists){
		if( exists){
			return
		}
		return fetch("https://raw.githubusercontent.com/schemaorg/schemaorg/sdo-phobos/data/schema.rdfa").then( function(response){
			if( response.status >= 400){
				throw new Error( "Incorrect response from Github:", response.status)
			}
			return fs.writeFile( "./"+ file, response.text())
		})
	})
})

gulp.task( "jsonld", ["source"], function(){
	
})
