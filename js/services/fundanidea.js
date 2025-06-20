var fundanideaService={
 add: function(fundanideaData) {
    return api.request({
      path: '/addFundanidea',
      method: 'POST',
      data: fundanideaData
    });
  },
  uploadDocument: function(file) {
    return api.uploadFile('/upload/documents', file, 'files');
  }
}
window.fundanideaService = fundanideaService;
