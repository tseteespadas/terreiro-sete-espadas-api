function afterResponse(req, res) {

  const reqInfo = {
    method: req.method,
    url: req.originalUrl,
    params: req.params,
    query: req.query,
    body: req.body,
    status: res.statusCode
  };

  console.log(reqInfo);
}

module.exports = afterResponse;