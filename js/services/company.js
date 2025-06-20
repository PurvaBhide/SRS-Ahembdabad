var CompanyService = {
  add: function(data) {
    return api.request({ path: '/addCompany', method: 'POST', data: data });
  },
  listAll: function() {
    return api.request({ path: '/listallcompanies', method: 'GET' });
  },
  getById: function(id) {
    return api.request({ path: '/projectshowbycompanieId/' + id, method: 'GET' });
  },
  update: function(id, data) {
    return api.request({ path: '/companyUpdate/' + id, method: 'PUT', data: data });
  },
  delete: function(id) {
    return api.request({ path: '/delete/' + id, method: 'DELETE' });
  }
};