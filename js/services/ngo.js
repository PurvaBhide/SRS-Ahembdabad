var NgoService = {
  listAll: function(page, size) {
    return api.request({ 
      path: '/listallNgo?page=' + (page || 0) + '&size=' + (size || 10), 
      method: 'GET' 
    });
  },
  getById: function(id) {
    return api.request({ path: '/getNgoById/' + id, method: 'GET' });
  },
};