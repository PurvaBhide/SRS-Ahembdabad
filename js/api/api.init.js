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


if (typeof fundanideaService !== 'undefined') {
  if (typeof Api === 'undefined') {
    window.Api = {};
  }
  window.Api.fundanidea = fundanideaService;
}

if (typeof newsandeventServices !== 'undefined') {
  Api.newsandevent = newsandeventServices;
}
// Add other services similarly
// Api.ngo = typeof NgoService !== 'undefined' ? NgoService : {};