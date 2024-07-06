const currency = [
  {
    "id": "USD",
    "name": "United States Dollar",
    "symbol": "$",
    "rate": 1.0,
    "description": "The primary currency of the United States and many other countries."
  },
  {
    "id": "EUR",
    "name": "Euro",
    "symbol": "€",
    "rate": 0.85,
    "description": "The official currency of many European countries."
  }
];

const getCurrency = (id) => {
  return currency.find(c => c.id === id);
}

const addCurrency = (id, name, symbol, rate, description) => {
  currency.push({
    id,
    name,
    symbol,
    rate,
    description
  });
}

module.exports.handler = async (req, resp, context) => {
  switch (req.method) {
    case "GET":
      if (req.path === "/currency") {
        resp.setStatusCode(200);
        resp.setHeader('Content-Type', 'application/json');
        resp.send(JSON.stringify(currency));
      } else if (req.path.match(/^\/currency\/(\w+)$/)) {
        const symbol = req.path.split("/")[2];
        const currencyData = getCurrency(symbol);
        if (currencyData) {
          resp.setStatusCode(200);
          resp.setHeader('Content-Type', 'application/json');
          resp.send(JSON.stringify({
            name: currencyData.name,
            symbol: currencyData.symbol,
            description: currencyData.description
          }));
        } else {
          resp.setStatusCode(404);
          resp.setHeader('Content-Type', 'application/json');
          resp.send(JSON.stringify({ status: 404, message: "Currency not found" }));
        }
      } else if (req.path.match(/^\/rate\/(\w+)$/)) {
        const symbol = req.path.split("/")[2];
        const currencyData = getCurrency(symbol);
        if (currencyData) {
          resp.setStatusCode(200);
          resp.setHeader('Content-Type', 'application/json');
          resp.send(JSON.stringify({
            rate: currencyData.rate
          }));
        } else {
          resp.setStatusCode(404);
          resp.setHeader('Content-Type', 'application/json');
          resp.send(JSON.stringify({ status: 404, message: "Currency not found" }));
        }
      } else if (req.path.match(/^\/rate\/(\w+)\/(\d+(\.\d+)?)$/)) {
        const [_, frSymbol, amountStr] = req.path.match(/^\/rate\/(\w+)\/(\d+(\.\d+)?)$/);
        const amount = parseFloat(amountStr);
        const currencyData = getCurrency(frSymbol);
        if (currencyData) {
          const exchangeAmount = amount * currencyData.rate;
          resp.setStatusCode(200);
          resp.setHeader('Content-Type', 'application/json');
          resp.send(JSON.stringify({
            exchange: exchangeAmount
          }));
        } else {
          resp.setStatusCode(404);
          resp.setHeader('Content-Type', 'application/json');
          resp.send(JSON.stringify({ status: 404, message: "Currency not found" }));
        }
      } else {
        resp.setStatusCode(404);
        resp.setHeader('Content-Type', 'application/json');
        resp.send(JSON.stringify({ status: 404, message: "Record not found" }));
      }
      break;

    case "POST":
      if (req.path === "/currency") {
        let newCurrency;
        try {
          newCurrency = JSON.parse(req.body);
        } catch (error) {
          resp.setStatusCode(400);
          resp.setHeader('Content-Type', 'application/json');
          resp.send(JSON.stringify({ status: 400, message: "Invalid JSON format" }));
          return;
        }

        const { id, name, symbol, rate, description } = newCurrency;

        if (!id || !name || !symbol || !rate || !description) {
          resp.setStatusCode(400);
          resp.setHeader('Content-Type', 'application/json');
          resp.send(JSON.stringify({ status: 400, message: "Missing required fields" }));
          return;
        }

        if (getCurrency(id)) {
          resp.setStatusCode(409);
          resp.setHeader('Content-Type', 'application/json');
          resp.send(JSON.stringify({ status: 409, message: "Currency already exists" }));
          return;
        }

        addCurrency(id, name, symbol, rate, description);
        resp.setStatusCode(201);
        resp.setHeader('Content-Type', 'application/json');
        resp.send(JSON.stringify({ status: 201, message: "Currency added successfully" }));
      } else {
        resp.setStatusCode(404);
        resp.setHeader('Content-Type', 'application/json');
        resp.send(JSON.stringify({ status: 404, message: "Endpoint not found" }));
      }
      break;

    case "PUT":
      if (req.path === "/currency") {
        let newCurrency;
        try {
          newCurrency = JSON.parse(req.body);
        } catch (error) {
          resp.setStatusCode(400);
          resp.setHeader('Content-Type', 'application/json');
          resp.send(JSON.stringify({ status: 501, description: "Currency CAN NOT be added." }));
          return;
        }

        const { id, name, symbol, rate, description } = newCurrency;

        if (!id || !name || !symbol || !rate || !description) {
          resp.setStatusCode(400);
          resp.setHeader('Content-Type', 'application/json');
          resp.send(JSON.stringify({ status: 501, description: "Currency CAN NOT be added." }));
          return;
        }

        if (getCurrency(id)) {
          resp.setStatusCode(409);
          resp.setHeader('Content-Type', 'application/json');
          resp.send(JSON.stringify({ status: 501, description: "Currency CAN NOT be added." }));
          return;
        }

        addCurrency(id, name, symbol, rate, description);
        resp.setStatusCode(201);
        resp.setHeader('Content-Type', 'application/json');
        resp.send(JSON.stringify({ status: 201, description: "New currency added." }));
      } else {
        resp.setStatusCode(404);
        resp.setHeader('Content-Type', 'application/json');
        resp.send(JSON.stringify({ status: 404, message: "Endpoint not found" }));
      }
      break;

    default:
      resp.setStatusCode(405);
      resp.setHeader('Content-Type', 'application/json');
      resp.send(JSON.stringify({ status: 405, message: "Method not allowed" }));
      break;
  }
};