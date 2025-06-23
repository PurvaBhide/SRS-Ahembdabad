var trackApplicationServices = {
  trackApplication: function (token) {
    return api.request({
      path: `/trackByToken/${token}`,
      method: "GET",
    });
  },
};
