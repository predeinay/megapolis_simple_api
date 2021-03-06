const http = require("http");
const conf = require("./conf");
const auth = require("./auth");

const routes = {
           "acc_info" : require("./models/acc_info"),
    "acc_transaction" : require("./models/acc_transaction"),
          "acc_meter" : require("./models/acc_meter"),
   "acc_meter_client" : require("./models/acc_meter_client"),
    "acc_transaction_detail": require('./models/acc_transaction_detail'),
    "acc_transaction_detail_string": require('./models/acc_transaction_detail_string'),
    "acc_invoice_download": require('./models/acc_invoice_download')
}

// err resp
const errResp = (res, errorMsg) => {
    res.writeHeader(404);
    res.write(JSON.stringify(
        { ok :false, errorMsg : errorMsg }
    ));
    res.end();
}

// bad auth resp
const errAuth = (res, errorMsg) => {
    res.writeHeader(401);
    res.write(JSON.stringify(
        { ok :false, errorMsg : errorMsg }
    ));
    res.end();
}

// without err resp
const okResp = (res, data) => {
    res.writeHeader(200);
    res.write(JSON.stringify(
        { ok :true, data : data }
    ));
    res.end();
}

const okRespFile = (res, data) => {
    res.setHeader('Content-length', data.size);
    res.setHeader('Content-Disposition', `attachment; filename=${data.name}`);
    res.write(data.file, 'binary');
    res.end();
}

http.createServer((req, res) => {
    // alway return json
    res.setHeader("Content-Type","application/json");
    if (!auth(req.headers)) {
        errAuth(res, "bad auth");
        return
    }
    const urlParams = req.url.split("/");
    const route = routes[urlParams[1]];
    if (!route) {
        errResp(res, "route not found");
        return
    }
    // call founded route
    route( { getParams : urlParams, postParams : {} }, (err, data) => {
        if (err) {
            errResp(res, err);
            return
        }

        if (urlParams[1] === 'acc_invoice_download') {
            okRespFile(res, data)
        } else {
            okResp(res,data);
        }
    } );

}).listen(conf.httpServerPort)
