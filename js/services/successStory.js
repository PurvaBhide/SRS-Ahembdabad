var SuccessStoryService = {
  create: function (data) {
    return api.post("/createsuccessstory", data);
  },
  listAll: function () {
    return api.get("/listallSuccessStory");
  },
  getById: function (id) {
    return api.get("/successStoryshowbyid/" + id);
  },
  getByCategory: function (categoryId) {
    return api.get("/SuccessStoryshowbycategoryid/" + categoryId);
  },
  update: function (id, data) {
    return api.put("/updateSuccessStory/" + id, data);
  },
  delete: function (id) {
    return api.delete("/deleteSuccessStory/" + id);
  },
  listAllpage: function (page, size) {
    return api.get(`/listallSuccessStory?page=${page || 0}&size=${size || 10}`);
  }
};
