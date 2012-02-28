var drupalgap_services_resource_call_result;

/** 
 * Make a call to a Drupal Service Resource.
 * 
 * options.resource_path
 * 		The path to the resource (required)
 * options.site_path
 * 		The full site path (default: drupalgap_settings.site_path)
 * options.base_path
 * 		The drupal base path (default: drupalgap_settings.base_path)
 * options.endpoint
 * 		The endpoint name (default : drupalgap_settings.services_endpoint_default)
 * options.type
 * 		The method to use: get, post (default), put, delete
 * options.dataType
 * 		The data type to use in the ajax call (default: json)
 * options.data
 * 		The data string to send with the ajax call (optional)
 * options.from_local_storage
 * 		Load service resource call from local storage.
 * 		"0" = force reload from service resource
 * 		"1" = grab from local storage if possible (default)
 * options.local_storage_key
 * 		The key to use when storing the service resource call result
 * 		in local storage. Default key formula: [options.type].[service_resource_call_url]
 * 		For example, a POST on the system connect resource would have a default key of 
 * 		post.http://www.drupalgap.org/?q=drupalgap/system/connect.json
 */
function drupalgap_services_resource_call (options) {
	
	// Clear previous service call result stored in global variable.
	drupalgap_services_resource_call_result = null;
	result = null;
	
	try {
		
		// Validate options.
		// TODO - need to validate all other options.
		if (!options.resource_path) {
			console.log("drupalgap_services_resource_call - no resource_path provided");
			return false;
		}
		
		// Set default values for options if none were provided.
		if (!options.site_path) {
			options.site_path = drupalgap_settings.site_path;
		}
		if (!options.base_path) {
			options.base_path = drupalgap_settings.base_path;
		}
		if (!options.endpoint) {
			options.endpoint = drupalgap_settings.services_endpoint_default;
		}
		if (!options.type) {
			options.type = "post";
		}
		if (!options.data) {
			options.data = "";
		}
		if (!options.dataType) {
			options.dataType = "json";
		}
		if (!options.from_local_storage) {
			options.from_local_storage = "1";
		}
		
		// Build URL to service resource.
		var service_resource_call_url = options.site_path + options.base_path + options.endpoint + "/" + options.resource_path;
		
		// Set default local storage key if one wasn't provided.
		if (!options.local_storage_key) {
			options.local_storage_key = options.type + "." + service_resource_call_url;
		}
		
		// If we are attempting to load the service resource result call from
		// localstorage, do it now.
		if (options.from_local_storage == "1") {
			result = window.localStorage.getItem(options.local_storage_key);
		}
		
		// If we loaded the service resource result from local storage,
		// parse it out.
		if (result) {
			console.log("loaded service resource from local storage (" + options.local_storage_key +")");
			result = JSON.parse(result);
		}
		else {
			// The result wasn't in local storage, make the service call.
		    $.ajax({
			      url: service_resource_call_url,
			      type: options.type,
			      data: options.data,
			      dataType: options.dataType,
			      async: false,
			      error: function (jqXHR, textStatus, errorThrown) {
		    			result = {
		    				"jqXHR":jqXHR,
		    				"textStatus":textStatus,
		    				"errorThrown":errorThrown,
		    			};
			      },
			      success: function (data) {
			    	  result = data;
			      }
		    });
		    
		    // Print service resource call debug info to console.
		    console.log(JSON.stringify({"path":service_resource_call_url,"options":options}));
		    console.log(JSON.stringify(result));
		    
		    // If there wasn't an error from the service call, save the result to local storage.
		    if (!result.errorThrown) {
			    window.localStorage.setItem(options.local_storage_key, JSON.stringify(result));
				console.log("saving service resource to local storage (" + options.local_storage_key +")");
		    }
			
		}
	}
	catch (error) {
		console.log("drupalgap_services_resource_call - " + error);
		console.log(JSON.stringify(options));
	}
	
	// Save a copy of the service resource call result in the
	// global variable in case anybody needs it.
	drupalgap_services_resource_call_result = result;
	
	return drupalgap_services_resource_call_result;
}