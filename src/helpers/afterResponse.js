function afterResponse(req, res) {

  const reqInfo = {
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    body: req.body,
    status: res.statusCode
  };

  console.log(reqInfo);
}

module.exports = afterResponse;