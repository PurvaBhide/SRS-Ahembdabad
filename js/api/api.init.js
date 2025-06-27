// api.init.js
var Api = {};

// Initialize services only if they exist
if (typeof CategoryService !== 'undefined') {
  Api.category = CategoryService;
}

if (typeof CompanyService !== 'undefined') {
  Api.company = CompanyService;
}

if (typeof NgoService !== 'undefined') {
  Api.ngo = NgoService;
}
if (typeof ProjectService  !== 'undefined') {
  Api.project = ProjectService ;

 }
if (typeof fundanideaService !== 'undefined') {
  if (typeof Api === 'undefined') {
    window.Api = {};
  }
  window.Api.fundanidea = fundanideaService;
}

if (typeof newsandeventServices !== 'undefined') {
  Api.newsandevent = newsandeventServices;

}
if(typeof trackApplicationServices !=='undefined'){
  Api.trackApplication = trackApplicationServices;
}

if(typeof participantNowServices !=='undefined'){
  Api.participantNow = participantNowServices;
}


if(typeof DocumentService !=='undefined'){
  Api.document = DocumentService;
}
if(typeof SuccessStoryService !== 'undefined'){
  Api.successstory = SuccessStoryService;
}
// Add other services similarly
// Api.ngo = typeof NgoService !== 'undefined' ? NgoService : {};