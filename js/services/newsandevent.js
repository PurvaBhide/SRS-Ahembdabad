var newsandeventServices={
   listAll: function(page = 0, size = 6) {
    return api.request({
      path: `/listallLatestUpdates?page=${page}&size=${size}`,
      method: 'GET'
    });
  }
}