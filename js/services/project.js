var ProjectService = {
  add: function(data) {
    return api.request({ path: '/addProject', method: 'POST', data: data });
  },
  listAll: function(page, size) {
    return api.request({ 
      path: '/listallProjects?page=' + (page || 0) + '&size=' + (size || 10), 
      method: 'GET' 
    });
  },
  getById: function(id) {
    return api.request({ path: '/projectshowbyid/' + id, method: 'GET' });
  },
  getByNgo: function(id) {
    return api.request({ path: '/projectshowbyngoid/' + id, method: 'GET' });
  },
  filter: function(params) {
    var query = Object.keys(params).map(function(key) {
      return key + '=' + encodeURIComponent(params[key]);
    }).join('&');
    return api.request({ path: '/projects/filter?' + query, method: 'GET' });
  },
  update: function(id, data) {
    return api.request({ path: '/updateProject/' + id, method: 'PUT', data: data });
  },
  delete: function(id) {
    return api.request({ path: '/deleteProject/' + id, method: 'DELETE' });
  }
};