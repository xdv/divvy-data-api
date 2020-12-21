# Divvy Charts API #

The Divvy Charts API, also known as the **Data API**, provides past and present information about the state of the Divvy Network through an HTTP API, with additional information calculated for analysis purposes. The Divvy Charts API is used as a data source by applications such as [Divvy Charts](https://www.divvycharts.com/) and [xdv.io](https://www.xdv.io/).

(The API does not follow the conventions of a REST API, but you can use an HTTP client to access it in the same way you would access a REST API.)

* [Architecture](#architecture)
* [Setup](#setup)
* [API Method Reference](#api-method-reference)



# Architecture #

The Divvy Charts API is a [Node.js](https://nodejs.org/) application that uses [HBase](http://hbase.apache.org/) as its datastore.

## Components ##

### Ledger Importer ###
The ledger importer imports ledgers from the Divvy Network into the data store.  The process is set up to import continously in real time as ledgers are validated, and also import historical ledgers.

### Data Store ###
The data store uses HBase to store ledgers. This is not as flexible as the old CouchDB data store, but it scales much better.

### API Server ###
Accessing the historical data is not done by querying the database directly but through a node.js API server.  The server takes requests in the form of JSON data, interprets it into one or several database queries, processes the data as necessary and returns the results.


# Setup #

Setup for the Divvy Charts API on top of HBase is not currently documented.

## Start API Service ##

The following command starts the API service:

`grunt watch`

(This requires read permissions to the database. Write permissions are not necessary.)

## Start Ledger Importer ##

The following command starts the ledger importer service:

`node db/importer`

Alternatively, you can use the experimental websocket-based importer:

`node db/import`

(Either way, you need write permission to the database.)



# Formatting Conventions #

Requests to the Charts API generally take the same format:

- Use the HTTP POST method
- The URL defines the API method to use
- All parameters are in the request body.
- The `Content-Type` header has the value `application/json`. **Caution:** If you omit or specify the wrong Content-Type, the API may respond with misleading error messages such as `{"error":"Please specify an account"}`

## Dates and Times ##
[Date-Time]: #dates-and-times

The Divvy Charts API uses Moment.js to parse strings, and therefore accepts [any date-time string that Moment.js recognizes](http://momentjs.com/docs/#supported-iso-8601-strings) as input.

The Divvy Charts API always outputs dates in UTC, in the following format:

YYYY-MM-DDThh-mm-ss+00:00

For example:
`2015-03-01T00:00:00+00:00`
(midnight exactly on March 3, 2015 UTC)


## Currency Objects ##
[Currency Object]: #currency-objects

Many methods define **a currency** as an object with the following fields:

| Field | Value | Description |
|-------|-------|-------------|
| currency | String | Three-letter [ISO 4217 Currency Code](http://www.xe.com/iso4217.php) string, or a 160-bit hex string according to Divvy's internal [Currency format](https://wiki.xdv.io/Currency_format). |
| issuer | String | Account address of the counterparty holding the currency. Usually an issuing gateway in the Divvy network. Omitted or `null` for XDV. |

Some methods describe **an amount of currency**, for example a quantity traded in a currency exchange. In [JSON format][Response Format], this takes the form of a nested JSON object with the following fields:

| Field | Value | Description |
|-------|-------|-------------|
| currency | String | Same as the `currency` field of a currency object. |
| issuer | String | Same as the `issuer` field of a currency object. |
| amount | Number | The quantity of the currency exchanged. |

In [CSV or array format][Response Format], a currency amount is specified as three separate attributes that correspond to the fields of the JSON object. The name of the fields depends on the context: for example, the `baseAmount` column is equivalent to the `amount` field of the `base` currency amount object.

**Warning:** JavaScript's native number type does not support `divvyd`'s full range of precision. When dealing with very large or very small numbers, the `amount` values returned by the Charts API lose precision.

## Response Formats ##
[Response Format]: #response-formats

Several methods provide a `format` parameter, which lets you request results in one of three formats:

* `csv` - [Comma-separated-values](http://en.wikipedia.org/wiki/Comma-separated_values) table. The first line is a row of column headers, and each subsequent line represents one result or interval, with its attributes in columns. The columns are separated by comma (`,`) characters.
* `json` - The request contains some top-level information at the top level, and a `results` array. Each member of the `results` array is a JSON object with attributes and values that represent one result or interval.
* **Two-dimensional array format** - If neither `csv` nor `json` is specified, the API returns an array of JSON arrays, in a format that resembles CSV. The first member of the top-level array is an array of table headers, and each subsequent member is a nested array representing one result or interval, with its members corresponding to the attribute names in the header row.



# API Method Reference #

To use a method in this document, append the path for that method to the hostname of the Charts API instance you want to use.  XDV.io runs a public instance of the Divvy Charts API with full data, available at:

**https://charts.xdv.io**

The API provides the following methods:

* [Account Offers Exercised - `POST /api/account_offers_exercised`](#account-offers-exercised)
* [Account Transaction Stats - `POST /api/account_transaction_stats`](#account-transaction-stats)
* [Account Transactions - `POST /api/account_transactions`](#account-transactions)
* [Accounts Created - `POST /api/accounts_created`](#accounts-created)
* [Exchange Rates - `POST /api/exchange_rates`](#exchange-rates)
* [Issuer Capitalization - `POST /api/issuer_capitalization`](#issuer-capitalization)
* [Ledgers Closed - `POST /api/ledgers_closed`](#ledgers-closed)
* [Market Traders - `POST /api/market_traders`](#market-traders)
* [Offers - `POST /api/offers`](#offers)
* [Offers Exercised - `POST /api/offers_exercised`](#offers-exercised)
* [Top Markets - `POST /api/top_markets`](#top-markets)
* [Total Network Value - `POST /api/total_network_value`](#total-network-value)
* [Total Value Sent - `POST /api/total_value_sent`](#total-value-sent)
* [Transaction Stats - `POST /api/transaction_stats`](#transaction-stats)
* [Value Sent - `POST /api/value_sent`](#value-sent)


## Account Offers Exercised ##
[[Source]<br>](https://github.com/xdv/divvy-data-api/blob/master/api/routes/accountOffersExercised.js "Source")

Retrieve currency-exchange orders being exercised for a single account.

#### Request Format ####

<!-- <div class='multicode'> -->

*JSON*

```
POST /api/account_offers_exercised
{
    "account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "startTime": "2014",
    "limit": 5,
    "offset": 0,
    "format": "json"
}
```

*CSV*

```
POST /api/account_offers_exercised
{
    "account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "startTime": "2014",
    "limit": 5,
    "offset": 0,
    "format": "csv"
}
```

*Array*

```
POST /api/account_offers_exercised
{
    "account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "startTime": "2014",
    "limit": 5,
    "offset": 0
}
```

<!-- </div> -->

[Try it! >](https://xdv.io/build/charts-api-tool/#account-offers-exercised)

The request includes the following body parameters:

| Field | Value | Description |
|-------|-------|-------------|
| account | String (Divvy address) | Retrieve currency-exchange orders exercised as a result of this account sending a transaction, or another transaction modifying an order previously placed by this account. |
| startTime | String ([Date-Time][]) | (Optional) Retrieve information starting at this time. Defaults to 30 days before `endTime`. |
| endTime | String ([Date-Time][]) | (Optional) Retrieve information ending at this time. Defaults to the current time. |
| descending | Boolean | (Optional) If true, return results in descending order. Defaults to false. |
| limit | Number | (Optional) The maximum number of transactions to return in one response. Use with `offset` to paginate results. Defaults to 500. |
| offest | Number | (Optional) The number of transactions to skip before returning results. Use with `limit` to paginate results. Defaults to 0. |
| format | String | (Optional) The [Response Format][] to use: `csv` or `json`. If omitted, defaults to a CSV-like JSON array format. |

#### Response Format ####

The format of the response depends on the `format` parameter from the request. See [Response Format][] for details. Examples of successful responses:

<!-- <div class='multicode'> -->

*JSON*

```
{
    "account": "rf1BiGeXwwQoi8Z2ueFYTEXSwuJYfV2Jpn",
    "startTime": "2014-01-01T00:00:00+00:00",
    "endTime": "2015-03-09T21:05:27+00:00",
    "results": [
        {
            "base": {
                "currency": "XDV",
                "issuer": null,
                "amount": 0.00001
            },
            "counter": {
                "currency": "USD",
                "issuer": "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
                "amount": 5.080000065049717e-8
            },
            "type": "buy",
            "rate": 196.8503937007874,
            "counterparty": "rUrgXPxenRbjnFDXKWUhH8mBJcQ2CyPfkG",
            "time": "2014-09-17T21:47:00+00:00",
            "txHash": "9D591B18EDDD34F0B6CF4223A2940AEA2C3CC778925BABF289E0011CD8FA056E",
            "ledgerIndex": 8924146
        }
    ]
}
```

*CSV*

```
baseCurrency, baseIssuer, baseAmount, counterCurrency, counterIssuer, counterAmount, type, rate, counterparty, time, txHash, ledgerIndex
XDV, , 0.00001, USD, rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc, 5.080000065049717e-8, buy, 196.8503937007874, rUrgXPxenRbjnFDXKWUhH8mBJcQ2CyPfkG, 2014-09-17T21:47:00+00:00, 9D591B18EDDD34F0B6CF4223A2940AEA2C3CC778925BABF289E0011CD8FA056E, 8924146
```

*Array*

```
[
    [
        "baseCurrency",
        "baseIssuer",
        "baseAmount",
        "counterCurrency",
        "counterIssuer",
        "counterAmount",
        "type",
        "rate",
        "counterparty",
        "time",
        "txHash",
        "ledgerIndex"
    ],
    [
        "XDV",
        null,
        0.00001,
        "USD",
        "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
        5.080000065049717e-8,
        "buy",
        196.8503937007874,
        "rUrgXPxenRbjnFDXKWUhH8mBJcQ2CyPfkG",
        "2014-09-17T21:47:00+00:00",
        "9D591B18EDDD34F0B6CF4223A2940AEA2C3CC778925BABF289E0011CD8FA056E",
        8924146
    ]
]
```

<!-- </div> -->

Each result in the response describes an individual transaction that exercised a currency exchange on the account. This includes [OfferCreate](https://xdv.io/build/transactions#offercreate) and cross-currency [Payment](https://xdv.io/build/transactions#payment) transactions that the account sent, as well as transactions that consumed an offer that the account had previously placed.

| Field | Type | Description |
|-------|------|-------------|
| base | Object ([Currency Amount][Currency Object]) | (JSON format only) Amount of one currency exchanged in this transaction. |
| baseCurrency | String ([currency name][Currency Object]) | (CSV and array formats only) Name of the base currency exchanged in this transaction. |
| baseIssuer | String ([currency issuer][Currency Object]) | (CSV and array formats only) Issuer of the base currency exchanged in this transaction. |
| baseAmount | String ([currency amount][Currency Object]) | (CSV and array formats only) Quantity of the base currency exchanged in this transaction. | 
| counter | Object ([Currency Amount][Currency Object]) | (JSON format only) Amount of the other currency exchanged in this transaction. |
| counterCurrency | String ([currency name][Currency Object]) | (CSV and array formats only) Name of the counter currency exchanged in this transaction. |
| counterIssuer | String ([currency issuer][Currency Object]) | (CSV and array formats only) Issuer of the counter currency exchanged in this transaction. |
| counterAmount | String ([currency amount][Currency Object]) | (CSV and array formats only) Quantity of the counter currency exchanged in this transaction. | 
| type | String | Either `buy` or `sell`. If the specified account sent the transaction, `buy` means the account acquired the counter currency. If another account sent the transaction, `buy` means the specified account acquired the base currency. (In both cases, `sell` means the reverse.) |
| rate | Number | The exchange ratio between the base and counter currency. |
| counterparty | String (Divvy address) | The other account involved in this exchange. |
| time | String ([Date-Time][]) | The time this transaction occurred, as defined by the close time of the ledger that included it. |
| txHash | String (Transaction Hash) | The identifying hash of the Divvy transaction that performed this exchange, as a hex string. |
| ledgerIndex | Number | The sequence number of the ledger that included this transaction. |


## Account Transaction Stats ##
[[Source]<br>](https://github.com/xdv/divvy-data-api/blob/develop/api/routes/accountTransactionStats.js "Source")

**DEPRECATED** This API method may return inaccurate results. Do not use it.

## Account Transactions ##
[[Source]<br>](https://github.com/xdv/divvy-data-api/blob/develop/api/routes/accountTransactions.js "Source")

**DEPRECATED** This API method may return inaccurate results. Do not use it.

## Accounts Created ##
[[Source]<br>](https://github.com/xdv/divvy-data-api/blob/develop/api/routes/accountsCreated.js "Source")

Retrieve information about the creation of new Divvy accounts.

#### Request Format ####

<!-- <div class='multicode'> -->

*Reduced*

```
POST /api/accounts_created
{
    "startTime": "2014-01-01T00:00:00.000Z",
    "endTime": "2015-03-31T00:00:00.000Z",
    "timeIncrement": "week",
    "descending": true,
    "reduce": true
}
```

*Expanded*

```
POST /api/accounts_created
{
    "startTime": "2015-01-01T00:00:00.000Z",
    "endTime": "2015-02-28T00:00:00.000Z",
    "timeIncrement": "week",
    "descending": true,
    "format": "json"
}
```

<!-- </div> -->

[Try it! >](https://xdv.io/build/charts-api-tool/#accounts-created)

The request includes the following body parameters:

| Field | Value | Description |
|-------|-------|-------------|
| startTime | String ([Date-Time][]) | Retrieve information starting at this time. |
| endTime | String ([Date-Time][]) | Retrieve information ending at this time. |
| timeIncrement | String | (Optional) Divide results into intervals of the specified length: `week`, `day`, `hour`. The value `all` collapses the results into just one interval. Defaults to `all`. |
| descending | Boolean | (Optional) If true, return results in descending order. Defaults to false. |
| reduce | Boolean | (Optional) If `false`, include accounts individually instead of collapsing them into results over time. Ignored if `timeIncrement` is provided. Defaults to `true`. |
| limit | Number | (Optional) If reduce is `false`, this value defines the maximum number of transactions to return in one response. Use with `offset` to paginate results. Defaults to 500. |
| offset | Number | (Optional) If reduce is `false`, this value defines a number of transactions to skip before returning results. Use with `limit` to paginate results. Defaults to 0. |
| format | String | (Optional) The [Response Format][] to use: `csv` or `json`. If omitted, defaults to a CSV-like JSON array format. |

#### Response Format ####

The format of the response depends on the `format` and `reduce` parameters from the request. See [Response Format][] for details. Examples of successful responses:

<!-- <div class='multicode'> -->

*Reduced*

```
[
  [
    "time",
    "count"
  ],
  [
    "2015-03-31T00:00:00+00:00",
    102478
  ]
]
```

*Expanded*

```
{
  "startTime": "2015-02-28T00:00:00+00:00",
  "endTime": "2015-01-01T00:00:00+00:00",
  "timeIncrement": "week",
  "total": 13814,
  "results": [
    {
      "time": "2015-02-23T00:00:00+00:00",
      "count": 1381
    },
    {
      "time": "2015-02-16T00:00:00+00:00",
      "count": 1551
    },
    {
      "time": "2015-02-09T00:00:00+00:00",
      "count": 1827
    },
    {
      "time": "2015-02-02T00:00:00+00:00",
      "count": 2017
    },
    {
      "time": "2015-01-26T00:00:00+00:00",
      "count": 1690
    },
    {
      "time": "2015-01-19T00:00:00+00:00",
      "count": 1638
    },
    {
      "time": "2015-01-12T00:00:00+00:00",
      "count": 1565
    },
    {
      "time": "2015-01-05T00:00:00+00:00",
      "count": 2145
    }
  ]
}
```

<!-- </div> -->

**If results are reduced** (the default), then each result represents an interval of time, with the following attributes, in order:

| Field | Type | Description |
|-------|------|-------------|
| time  | String ([Date-Time][]) | The time this interval begins |
| count | Number | The number of accounts created (successfully funded with the XDV reserve) in this interval. |

**If the results are not reduced** (the request specified `reduce` as false and did not include a `timeIncrement`), then each result represents an individual account that was created, with the following attributes:

| Field | Type | Description |
|-------|------|-------------|
| time  | String ([Date-Time][]) | The time this account was created, as defined by the close time of the ledger containing the transaction that created it. |
| account | String (Divvy Address) | The address of the newly-created account. |
| txHash | String (Transaction Hash) | The identifying hash of the transaction that created this account. |
| ledgerIndex | Number | The sequence number of the ledger when this account was created. |


## Exchange Rates ##
[[Source]<br>](https://github.com/xdv/divvy-data-api/blob/develop/api/routes/exchangeRates.js "Source")

Retrieve information about the exchange rates between one or more pairs of currency, based on trading activity in the network.

#### Request Format ####

<!-- <div class='multicode'> -->

*Multiple*

```
POST /api/exchange_rates
{
    "pairs": [
        {
            "base": {
                "currency": "CNY",
                "issuer": "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK"
            },
            "counter": {
                "currency": "XDV"
            }
        },
        {
            "base": {
                "currency": "MXN",
                "issuer": "rG6FZ31hDHN1K5Dkbma3PSB5uVCuVVRzfn"
            },
            "counter": {
                "currency": "USD",
                "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
            }
        }
    ],
    "range": "day"
}
```

*Single*

```
{
    "base": {
        "currency": "CNY",
        "issuer": "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK"
    },
    "counter": {
        "currency": "XDV"
    },
    "range": "day"
}
```

*Live*

```
{
    "pairs": [
        {
            "base": {
                "currency": "BTC",
                "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
            },
            "counter": {
                "currency": "XDV"
            },
            "depth": 0
        },
        {
            "base": {
                "currency": "BTC",
                "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
            },
            "counter": {
                "currency": "XDV"
            },
            "depth": 1000
        }
    ],
    "live": true
}
```

<!-- </div> -->

[Try it! >](https://xdv.io/build/charts-api-tool/#exchange-rates)

The request includes the following body parameters:

| Field | Value | Description |
|-------|-------|-------------|
| pairs | Array | (Optional) Array of currency pairs to compare. Each member of the array should be an object with a `base` field and a `counter` field, whose values are [Currency Objects][Currency Object]. If `live` is true, each pair can also include a `depth` field specifying how deep to dig into the order book to calculate the live rate. |
| base  | Object ([Currency Object][]) | (Optional) One currency to compare. Ignored if `pairs` provided. |
| counter | Object ([Currency Object][]) | (Optional) The other currency to compare. Ignored if `pairs` provided. |
| depth | Number | (Optional) Ignored unless `live` is true. Ignored if `pairs` is provided. Retrieve exchange rates for this amount of the `counter` currency. Provides a more accurate picture when the best orders in the market do not have enough volume to fully satisfy an exchange. Defaults to 0 (use the first bid and ask only). |
| range | String | (Optional) Time period over which the exchange rate is calculated: `year`, `month`, `week`, `day`, or `hour`. Defaults to `day`. Ignored if `live` is true. |
| last | Boolean | (Optional) If true, only return the price from the most recent exchange, without calculating [VWAP](https://en.wikipedia.org/wiki/Volume-weighted_average_price). Use for a faster response. Defaults to false. |
| live | Boolean | (Optional) If true, retrieve the current price directly from the Divvy network instead, as the midpoint between weighted average of the bid and asks up to the depth specified . Otherwise, use historical data from the past `range` amount of time. Defaults to false. |

You must provide either `pairs` or both `base` and `counter`.

#### Response Format ####

Examples of successful responses:

<!-- <div class='multicode'> -->

*Single*

```
[
    {
        "base": {
            "currency": "CNY",
            "issuer": "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK",
            "name": "divvyCN"
        },
        "counter": {
            "currency": "XDV"
        },
        "rate": 15.360721689111838,
        "last": 15.699279
    }
]
```

*Multiple*

```
[
    {
        "base": {
            "currency": "CNY",
            "issuer": "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK",
            "name": "divvyCN"
        },
        "counter": {
            "currency": "XDV"
        },
        "rate": 15.360721689111838,
        "last": 15.699279
    },
    {
        "base": {
            "currency": "MXN",
            "issuer": "rG6FZ31hDHN1K5Dkbma3PSB5uVCuVVRzfn",
            "name": "Bitso"
        },
        "counter": {
            "currency": "USD",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "name": "SnapSwap"
        },
        "rate": 0.0626248440992736,
        "last": 0.064269
    }
]
```

*Live*

```
[
    {
        "base": {
            "currency": "BTC",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "name": "SnapSwap"
        },
        "counter": {
            "currency": "XDV"
        },
        "rate": 25136.142311030344
    },
    {
        "base": {
            "currency": "BTC",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "name": "SnapSwap"
        },
        "counter": {
            "currency": "XDV"
        },
        "depth": 1000,
        "rate": 27250.470591648358
    }
]
```

<!-- </div> -->

A successful result contains a JSON array. Each member of the array represents a currency pair, as an object with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| base  | Object ([Currency Object][]) | The base currency specified for this pair, possibly including a `name` field with the Divvy Name for the `issuer` address. |
| counter | Object ([Currency Object][]) | The counter currency specified for this pair, possibly including a `name` field with the Divvy Name for the `issuer` address. |
| depth | Number | (May be omitted) The depth to search for this currency pair, if provided. |
| rate  | Number | (May be omitted) The amount of the counter currency that you can purchase with 1 unit of the base currency. By default, this is calculated [volume-weighted average price](https://en.wikipedia.org/wiki/Volume-weighted_average_price) for all exchanges executed during the `range` period from the request. If the request specified `live` as true, this is instead calculated as the midpoint between the weighted average of current bid and ask rates in the network up to the specified `depth`. Omitted if the request specified `last` as `true`. |
| last | Number | (May be omitted) The rate of the single most recent exchange to take place. |

If no exchanges are found for a currency pair from the request, that pair is omitted from the response.


## Issuer Capitalization ##
[[Source]<br>](https://github.com/xdv/divvy-data-api/blob/develop/api/routes/issuerCapitalization.js "Source")

Retrieve the total capitalization (outstanding balance) of specified currency issuers over time.

#### Request Format ####

<!-- <div class='multicode'> -->

*Request*

```
POST /api/issuer_capitalization
{
    "currencies": [
        {
            "currency": "USD",
            "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
        },
        {
            "currency": "USD",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
        }
    ],
    "startTime": "2014-01-01T10:00:00.000Z",
    "endTime": "2015-01-01T10:00:00.000Z",
    "timeIncrement": "month"
}
```

<!-- </div> -->

[Try it! >](https://xdv.io/build/charts-api-tool/#issuer-capitalization)

The request includes the following body parameters:

| Field | Value | Description |
|-------|-------|-------------|
| currencies | Array of [Currency Objects][Currency Object]) | A list of currency/issuer pairs to look up. |
| startTime |  String ([Date-Time][]) | Retrieve information starting at this time. |
| endTime | String ([Date-Time][]) | Retrieve information ending at this time. |
| timeIncrement | String | (Optional) Divide results into intervals of the specified length: `year`, `month`, `day`, `hour`, `minute`, or `second`. The value `all` collapses the results into just one interval. Defaults to `all`. Ignored if `reduce` is `false`. |

#### Response Format ####

An example of a successful response:

```
[
    {
        "currency": "USD",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
        "name": "Bitstamp",
        "hotwallets": [
            "rrpNnNLKrartuEqfJGpqyDwPj1AFPg9vn1",
            "rGFuMiw48HdbnrUbkRYuitXTmfrDBNTCnX"
        ],
        "results": [
            [
                "2014-01-01T00:00:00+00:00",
                2182532.512563024
            ],
            [
                "2014-02-01T00:00:00+00:00",
                1672428.6072806932
            ],
            [
                "2014-03-01T00:00:00+00:00",
                1475205.4287192414
            ],
            [
                "2014-04-01T00:00:00+00:00",
                1475129.7523240475
            ],
            [
                "2014-05-01T00:00:00+00:00",
                1641170.5998081048
            ],
            [
                "2014-06-01T00:00:00+00:00",
                2823512.0227728607
            ],
            [
                "2014-07-01T00:00:00+00:00",
                2181718.7345464956
            ],
            [
                "2014-08-01T00:00:00+00:00",
                2150290.1475041625
            ],
            [
                "2014-09-01T00:00:00+00:00",
                1370978.1335410434
            ],
            [
                "2014-10-01T00:00:00+00:00",
                1386720.726560316
            ],
            [
                "2014-11-01T00:00:00+00:00",
                1171158.4417431813
            ],
            [
                "2014-12-01T00:00:00+00:00",
                1651264.0460538066
            ],
            [
                "2015-01-01T00:00:00+00:00",
                2272895.4608580153
            ]
        ]
    },
    {
        "currency": "USD",
        "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
        "name": "SnapSwap",
        "hotwallets": [
            "ra7JkEzrgeKHdzKgo4EUUVBnxggY4z37kt",
            "rQsAshmCjPsxkYnxY9GnmBTAeEUaePDAie",
            "rEk9i7G8ac1kUs1mFjtze1qjj9FzGvXAG",
            "rsTQ7iwrCik9Ugc3zbpcbo2K3SbAdYJss1",
            "rwm98fCBS8tV1YB8CGho8zUPW5J7N41th2",
            "rnd8KJ4qeip6FPJvC1fyv82nW2Lm8C8KjQ",
            "r5ymZSvtdNgbKVc8ay1Jhmq5f9QgnvEtj"
        ],
        "results": [
            [
                "2014-01-01T00:00:00+00:00",
                308414.17014300067
            ],
            [
                "2014-02-01T00:00:00+00:00",
                221127.8278553265
            ],
            [
                "2014-03-01T00:00:00+00:00",
                189103.31201476356
            ],
            [
                "2014-04-01T00:00:00+00:00",
                166239.66201052035
            ],
            [
                "2014-05-01T00:00:00+00:00",
                181126.05199917927
            ],
            [
                "2014-06-01T00:00:00+00:00",
                352360.96199815325
            ],
            [
                "2014-07-01T00:00:00+00:00",
                406900.8018140941
            ],
            [
                "2014-08-01T00:00:00+00:00",
                522981.4027866862
            ],
            [
                "2014-09-01T00:00:00+00:00",
                823727.7361699624
            ],
            [
                "2014-10-01T00:00:00+00:00",
                1285657.1682029555
            ],
            [
                "2014-11-01T00:00:00+00:00",
                1162233.7115210893
            ],
            [
                "2014-12-01T00:00:00+00:00",
                1631690.8946927704
            ],
            [
                "2015-01-01T00:00:00+00:00",
                3778040.482102244
            ]
        ]
    }
]
```

A successful result contains a **JSON array** of objects representing the issuers from the request. Each member object has the following fields:

| Field | Type | Description |
|-------|------|-------------|
| currency | String | Currency code of the currency described by this record. |
| issuer | String (Divvy Address) | The account address of the gateway issuing this currency. |
| name | String | The name of this gateway, which usually corresponds to the Divvy Name of the account. |
| hotwallets | Array of Divvy Addresses | Hot wallets controlled by this gateway. Assets held by these accounts are not counted towards the capitalization. |
| results | Array of Arrays | The capitalization of the issuer/currency pair as an array of intervals. Each nested array has two values: a String ([Date-Time][]) specifying the beginning of the interval, and a number representing the total units of the currency distributed through the network at the time. |

The list of gateway names and hot wallets is defined by the [gateways.json](https://github.com/xdv/divvy-data-api/blob/a6c23a8c1bc5f073f2dd2bf32e8d763b66b6a2e3/api/gateways.json) file in the server tree. In the future, this may be [expanded to use host-meta](https://divvylabs.atlassian.net/browse/RD-75).


## Ledgers Closed ##
[[Source]<br>](https://github.com/xdv/divvy-data-api/blob/develop/api/routes/ledgersClosed.js "Source")

Retrieve information about ledgers closed over time.

#### Request Format ####

<!-- <div class='multicode'> -->

*Reduced*

```
POST /api/ledgers_closed
{
    "startTime": "2014-01-01T10:00:00.000Z",
    "endTime": "2015-01-01T10:00:00.000Z",
    "timeIncrement": "month",
    "descending": false,
    "reduce": true,
    "format": "json"
}
```

*Expanded*

```
POST /api/ledgers_closed
{
    "startTime": "2015-01-01T10:00:00.000Z",
    "endTime": "2015-01-02T10:00:00.000Z",
    "descending": false,
    "reduce": false,
    "limit": 50,
    "offset": 0,
    "format": "json"
}
```

*Minimal*

```
POST /api/ledgers_closed
{}
```

<!-- </div> -->

[Try it! >](https://xdv.io/build/charts-api-tool/#ledgers-closed)

The request includes the following body parameters:

| Field | Value | Description |
|-------|-------|-------------|
| startTime | String ([Date-Time][]) | (Optional) Retrieve information starting at this time. Defaults to 30 days before `endTime`. |
| endTime | String ([Date-Time][]) | (Optional) Retrieve information ending at this time. Defaults to the current time. |
| timeIncrement | String | (Optional) Divide results into intervals of the specified length: `year`, `month`, `day`, `hour`, `minute`, or `second`. The value `all` collapses the results into just one interval. Defaults to `all`. Ignored if `reduce` is `false`. |
| descending | Boolean | (Optional) If true, return results with the most recent first. Defaults to true. |
| reduce | Boolean | (Optional) If `false`, include ledgers individually instead of collapsing them into results over time. Defaults to `true`. |
| limit | Number | (Optional) The maximum number of ledgers to return in one response. Use with `offset` to paginate results. Ignored if `reduce` is false. Defaults to 500. |
| offest | Number | (Optional) The number of transactions to skip before returning results. Use with `limit` to paginate results. Ignored if `reduce` is false. Defaults to 0. |
| format | String | (Optional) The [Response Format][] to use: `csv` or `json`. If omitted, defaults to a CSV-like JSON array format. |

#### Response Format ####

The format of the response depends on the `format` and `reduce` parameters from the request. See [Response Format][] for details. Examples of successful responses:

<!-- <div class='multicode'> -->

*Reduced*

```
{
    "startTime": "2014-01-01T00:00:00+00:00",
    "endTime": "2015-01-01T00:00:00+00:00",
    "timeIncrement": "month",
    "total": 6655524,
    "results": [
        {
            "time": "2014-01-01T00:00:00+00:00",
            "count": 551361
        },
        {
            "time": "2014-02-01T00:00:00+00:00",
            "count": 528527
        },
        {
            "time": "2014-03-01T00:00:00+00:00",
            "count": 565889
        },
        {
            "time": "2014-04-01T00:00:00+00:00",
            "count": 546201
        },
        {
            "time": "2014-05-01T00:00:00+00:00",
            "count": 569552
        },
        {
            "time": "2014-06-01T00:00:00+00:00",
            "count": 551485
        },
        {
            "time": "2014-07-01T00:00:00+00:00",
            "count": 569394
        },
        {
            "time": "2014-08-01T00:00:00+00:00",
            "count": 558809
        },
        {
            "time": "2014-09-01T00:00:00+00:00",
            "count": 504121
        },
        {
            "time": "2014-10-01T00:00:00+00:00",
            "count": 558358
        },
        {
            "time": "2014-11-01T00:00:00+00:00",
            "count": 547955
        },
        {
            "time": "2014-12-01T00:00:00+00:00",
            "count": 603870
        },
        {
            "time": "2015-01-01T00:00:00+00:00",
            "count": 2
        }
    ]
}
```

*Expanded*

```
{
    "startTime": "2015-01-01T00:00:00+00:00",
    "endTime": "2015-01-02T00:00:00+00:00",
    "total": 10,
    "results": [
        {
            "time": "2015-01-01T00:00:00+00:00",
            "ledgerIndex": 10852618
        },
        {
            "time": "2015-01-01T00:00:00+00:00",
            "ledgerIndex": 10852619
        },
        {
            "time": "2015-01-01T00:00:10+00:00",
            "ledgerIndex": 10852620
        },
        {
            "time": "2015-01-01T00:00:10+00:00",
            "ledgerIndex": 10852621
        },
        {
            "time": "2015-01-01T00:00:20+00:00",
            "ledgerIndex": 10852622
        },
        {
            "time": "2015-01-01T00:00:20+00:00",
            "ledgerIndex": 10852623
        },
        {
            "time": "2015-01-01T00:00:20+00:00",
            "ledgerIndex": 10852624
        },
        {
            "time": "2015-01-01T00:00:30+00:00",
            "ledgerIndex": 10852625
        },
        {
            "time": "2015-01-01T00:00:30+00:00",
            "ledgerIndex": 10852626
        },
        {
            "time": "2015-01-01T00:00:40+00:00",
            "ledgerIndex": 10852627
        }
    ]
}
```

*Minimal*

```
581851
```

<!-- </div> -->

**If results are reduced** (the default), then each result represents an interval of time, with the following attributes, in order:

| Field | Type | Description |
|-------|------|-------------|
| time  | String ([Date-Time][]) | The start time of this interval. |
| count | Number | The number of ledgers that closed during this interval. |

**If the results are not reduced** (the request used `"reduce":false`), then each result represents an individual ledger, with the following attributes:

| Field | Type | Description |
|-------|------|-------------|
| time  | String ([Date-Time][]) | The approximate time this ledger closed. |
| ledgerIndex | Number | The sequence number of this ledger. |

**If neither reduce nor timeIncrement are provided**, the response body is simply an integer indicating the number of ledgers closed during the requested window. 


## Market Traders ##
[[Source]<br>](https://github.com/xdv/divvy-data-api/blob/develop/api/routes/marketTraders.js "Source")

Return a list of accounts that participated in trading a specified currency exchange.

#### Request Format ####

<!-- <div class='multicode'> -->

*Transactions Included*

```
POST /api/market_traders
{
    "base": {
        "currency": "XDV"
    },
    "counter": {
        "currency": "KRW",
        "issuer": "rUkMKjQitpgAM5WTGk79xpjT38DEJY283d"
    },
    "startTime": "2014-11-01T10:00:00.000Z",
    "transactions": true,
    "format": "json"
}
```

*Default Markets*

```
POST /api/market_traders
{
    "startTime": "2013-02-26T10:00:00.000Z",
    "format": "json"
}
```

<!-- </div> -->

[Try it! >](https://xdv.io/build/charts-api-tool/#market-traders)

The request includes the following body parameters:

| Field | Value | Description |
|-------|-------|-------------|
| base  | Object ([Currency Object][]) | (Optional) One of the currencies being exchanged. Required if `counter` is specified. |
| counter | Object ([Currency Object][]) | (Optional) The other of the currencies being exchanged. Required if `base` is specified. |
| startTime | String ([Date-Time][]) | (Optional) Retrieve information starting at this time. If omitted, use the `period` ending at the current time. |
| period | String | (Optional) One of the following values: `3d` (three days), `7d` (seven days), or `24h` (24 hours). Defaults to `24h`. |
| transactions | Boolean | (Optional) If true, include individual transactions in the response. Defaults to false. Ignored if `format` is csv. |
| format | String | (Optional) The [Response Format][] to use: `csv` or `json`. If omitted, defaults to a CSV-like JSON array format. |

If both `base` and `counter` are omitted, the API combines the results from a [hardcoded list of popular markets](https://github.com/xdv/divvy-data-api/blob/2d456ace25c7ee157ed510b801ccc987b58d5d92/api/routes/marketTraders.js#L81-L92) with XDV as the base currency.

**Note:** This method *does not* have an `endTime` parameter.

#### Response Format ####

The format of the response depends on the `format` and `reduce` parameters from the request. See [Response Format][] for details. Examples of successful responses:

<!-- <div class='multicode'> -->

*Transactions Included*

```
{
    "startTime": "2014-11-01T00:00:00+00:00",
    "endTime": "2014-11-02T00:00:00+00:00",
    "results": [
        {
            "buy": {
                "baseVolume": 0,
                "counterVolume": 0,
                "count": 0
            },
            "sell": {
                "baseVolume": 314,
                "counterVolume": 1776.2,
                "count": 7
            },
            "account": "rhLKAC1yy92YSfM45LE7KQ6CcuJF4pJSdR",
            "baseVolume": 314,
            "counterVolume": 1776.2,
            "count": 7,
            "transactions": [
                [
                    "2014-11-01T06:45:40+00:00",
                    5.6,
                    0.08,
                    0.44800000000009277,
                    "rhLKAC1yy92YSfM45LE7KQ6CcuJF4pJSdR",
                    "r3drXrWREtPbe8EjqwQib6fbpCoKBF2Pfg",
                    "12EEDEF7ACB178F589D3308962D394FC50A6B018B1CBFF1983E5F2AA00F35C3F",
                    9690578
                ],
                [
                    "2014-11-01T06:50:10+00:00",
                    5.6,
                    0.00823,
                    0.046087999999826934,
                    "rhLKAC1yy92YSfM45LE7KQ6CcuJF4pJSdR",
                    "r3drXrWREtPbe8EjqwQib6fbpCoKBF2Pfg",
                    "C131B35C504B29EA2A57F02E0930C8E6A70D5353B024FA811DD3319817E4F096",
                    9690630
                ],
                [
                    "2014-11-01T06:56:50+00:00",
                    5.6,
                    0.000001,
                    0.0000048198000968113774,
                    "rhLKAC1yy92YSfM45LE7KQ6CcuJF4pJSdR",
                    "r3drXrWREtPbe8EjqwQib6fbpCoKBF2Pfg",
                    "89BDB5CF8003DF370974E5755E68E055A38D75D3319F36698A4EA6FAEFD35562",
                    9690706
                ],
                [
                    "2014-11-01T07:32:10+00:00",
                    5.6,
                    0.00015,
                    0.0008370000000468281,
                    "rhLKAC1yy92YSfM45LE7KQ6CcuJF4pJSdR",
                    "r3drXrWREtPbe8EjqwQib6fbpCoKBF2Pfg",
                    "62E570CDA203BB757796BD2EFCC1ED6B723FA0AAB7084F0F6FC65AAD6D6466C8",
                    9691142
                ],
                [
                    "2014-11-01T14:17:10+00:00",
                    5.6,
                    199.911619,
                    1119.5050701802,
                    "rhLKAC1yy92YSfM45LE7KQ6CcuJF4pJSdR",
                    "rJ11W7nDukN1sWKcyhSGdZWbKKGQkYntyA",
                    "E0E22F48F9A61665C45932BC2BD4CF2112F5B2FA7A184A2AF647B90EE364FC2E",
                    9696061
                ],
                [
                    "2014-11-01T14:17:30+00:00",
                    5.699999999999999,
                    50,
                    285,
                    "rhLKAC1yy92YSfM45LE7KQ6CcuJF4pJSdR",
                    "rJ11W7nDukN1sWKcyhSGdZWbKKGQkYntyA",
                    "1BE8EDD238D3B7988412E605E44024912F5B715BDE92F5ECB2B5ADB5BCD17AC7",
                    9696066
                ],
                [
                    "2014-11-01T14:17:50+00:00",
                    5.800000000000001,
                    64,
                    371.2,
                    "rhLKAC1yy92YSfM45LE7KQ6CcuJF4pJSdR",
                    "rJ11W7nDukN1sWKcyhSGdZWbKKGQkYntyA",
                    "B5A56CCAB5DCEA40CEC8F8B9D2077185893D307282936024375B91CD4917240C",
                    9696070
                ]
            ]
        },
        {
            "buy": {
                "baseVolume": 0.088381,
                "counterVolume": 0.49492981980006334,
                "count": 4
            },
            "sell": {
                "baseVolume": 34.098334,
                "counterVolume": 187.54083700000047,
                "count": 1
            },
            "account": "r3drXrWREtPbe8EjqwQib6fbpCoKBF2Pfg",
            "baseVolume": 34.186715,
            "counterVolume": 188.03576681980053,
            "count": 5,
            "transactions": [
                [
                    "2014-11-01T06:45:40+00:00",
                    5.6,
                    0.08,
                    0.44800000000009277,
                    "rhLKAC1yy92YSfM45LE7KQ6CcuJF4pJSdR",
                    "r3drXrWREtPbe8EjqwQib6fbpCoKBF2Pfg",
                    "12EEDEF7ACB178F589D3308962D394FC50A6B018B1CBFF1983E5F2AA00F35C3F",
                    9690578
                ],
                [
                    "2014-11-01T06:50:10+00:00",
                    5.6,
                    0.00823,
                    0.046087999999826934,
                    "rhLKAC1yy92YSfM45LE7KQ6CcuJF4pJSdR",
                    "r3drXrWREtPbe8EjqwQib6fbpCoKBF2Pfg",
                    "C131B35C504B29EA2A57F02E0930C8E6A70D5353B024FA811DD3319817E4F096",
                    9690630
                ],
                [
                    "2014-11-01T06:56:50+00:00",
                    5.6,
                    0.000001,
                    0.0000048198000968113774,
                    "rhLKAC1yy92YSfM45LE7KQ6CcuJF4pJSdR",
                    "r3drXrWREtPbe8EjqwQib6fbpCoKBF2Pfg",
                    "89BDB5CF8003DF370974E5755E68E055A38D75D3319F36698A4EA6FAEFD35562",
                    9690706
                ],
                [
                    "2014-11-01T07:30:00+00:00",
                    5.500000000000001,
                    34.098334,
                    187.54083700000047,
                    "r3drXrWREtPbe8EjqwQib6fbpCoKBF2Pfg",
                    "rMcGGXYeY9QFNt1fQAP3Gfpe8CdRaEfAmM",
                    "0CF2D0F5EC58BE54F6C31CD2F3C0C5483A340FCE27D7B7C8D84AFA8888A6A0B4",
                    9691114
                ],
                [
                    "2014-11-01T07:32:10+00:00",
                    5.6,
                    0.00015,
                    0.0008370000000468281,
                    "rhLKAC1yy92YSfM45LE7KQ6CcuJF4pJSdR",
                    "r3drXrWREtPbe8EjqwQib6fbpCoKBF2Pfg",
                    "62E570CDA203BB757796BD2EFCC1ED6B723FA0AAB7084F0F6FC65AAD6D6466C8",
                    9691142
                ]
            ]
        },
        {
            "buy": {
                "baseVolume": 1463.376734,
                "counterVolume": 8048.572037,
                "count": 3
            },
            "sell": {
                "baseVolume": 0,
                "counterVolume": 0,
                "count": 0
            },
            "account": "rMcGGXYeY9QFNt1fQAP3Gfpe8CdRaEfAmM",
            "baseVolume": 1463.376734,
            "counterVolume": 8048.572037,
            "count": 3,
            "transactions": [
                [
                    "2014-11-01T07:30:00+00:00",
                    5.500000000000001,
                    34.098334,
                    187.54083700000047,
                    "r3drXrWREtPbe8EjqwQib6fbpCoKBF2Pfg",
                    "rMcGGXYeY9QFNt1fQAP3Gfpe8CdRaEfAmM",
                    "0CF2D0F5EC58BE54F6C31CD2F3C0C5483A340FCE27D7B7C8D84AFA8888A6A0B4",
                    9691114
                ],
                [
                    "2014-11-01T13:59:50+00:00",
                    5.500000000000001,
                    966.294955,
                    5314.622252499999,
                    "rajdkuhURyoFCg9z36eHd75r2QTuEESFKe",
                    "rMcGGXYeY9QFNt1fQAP3Gfpe8CdRaEfAmM",
                    "F6797151ACD0AFA86C4E7FAE8948CEAB67982F623BF2FBCD9044E5CA216876F4",
                    9695862
                ],
                [
                    "2014-11-01T14:00:10+00:00",
                    5.500000000000001,
                    462.983445,
                    2546.4089475,
                    "rajdkuhURyoFCg9z36eHd75r2QTuEESFKe",
                    "rMcGGXYeY9QFNt1fQAP3Gfpe8CdRaEfAmM",
                    "F4C06FBFFFEAA3B47034D99DACC6CB9738823E0F1473096C4BACA7035FCAC90D",
                    9695866
                ]
            ]
        },
        {
            "buy": {
                "baseVolume": 0,
                "counterVolume": 0,
                "count": 0
            },
            "sell": {
                "baseVolume": 1429.2784,
                "counterVolume": 7861.031199999999,
                "count": 2
            },
            "account": "rajdkuhURyoFCg9z36eHd75r2QTuEESFKe",
            "baseVolume": 1429.2784,
            "counterVolume": 7861.031199999999,
            "count": 2,
            "transactions": [
                [
                    "2014-11-01T13:59:50+00:00",
                    5.500000000000001,
                    966.294955,
                    5314.622252499999,
                    "rajdkuhURyoFCg9z36eHd75r2QTuEESFKe",
                    "rMcGGXYeY9QFNt1fQAP3Gfpe8CdRaEfAmM",
                    "F6797151ACD0AFA86C4E7FAE8948CEAB67982F623BF2FBCD9044E5CA216876F4",
                    9695862
                ],
                [
                    "2014-11-01T14:00:10+00:00",
                    5.500000000000001,
                    462.983445,
                    2546.4089475,
                    "rajdkuhURyoFCg9z36eHd75r2QTuEESFKe",
                    "rMcGGXYeY9QFNt1fQAP3Gfpe8CdRaEfAmM",
                    "F4C06FBFFFEAA3B47034D99DACC6CB9738823E0F1473096C4BACA7035FCAC90D",
                    9695866
                ]
            ]
        },
        {
            "buy": {
                "baseVolume": 313.911619,
                "counterVolume": 1775.7050701802,
                "count": 3
            },
            "sell": {
                "baseVolume": 0,
                "counterVolume": 0,
                "count": 0
            },
            "account": "rJ11W7nDukN1sWKcyhSGdZWbKKGQkYntyA",
            "baseVolume": 313.911619,
            "counterVolume": 1775.7050701802,
            "count": 3,
            "transactions": [
                [
                    "2014-11-01T14:17:10+00:00",
                    5.6,
                    199.911619,
                    1119.5050701802,
                    "rhLKAC1yy92YSfM45LE7KQ6CcuJF4pJSdR",
                    "rJ11W7nDukN1sWKcyhSGdZWbKKGQkYntyA",
                    "E0E22F48F9A61665C45932BC2BD4CF2112F5B2FA7A184A2AF647B90EE364FC2E",
                    9696061
                ],
                [
                    "2014-11-01T14:17:30+00:00",
                    5.699999999999999,
                    50,
                    285,
                    "rhLKAC1yy92YSfM45LE7KQ6CcuJF4pJSdR",
                    "rJ11W7nDukN1sWKcyhSGdZWbKKGQkYntyA",
                    "1BE8EDD238D3B7988412E605E44024912F5B715BDE92F5ECB2B5ADB5BCD17AC7",
                    9696066
                ],
                [
                    "2014-11-01T14:17:50+00:00",
                    5.800000000000001,
                    64,
                    371.2,
                    "rhLKAC1yy92YSfM45LE7KQ6CcuJF4pJSdR",
                    "rJ11W7nDukN1sWKcyhSGdZWbKKGQkYntyA",
                    "B5A56CCAB5DCEA40CEC8F8B9D2077185893D307282936024375B91CD4917240C",
                    9696070
                ]
            ]
        }
    ]
}
```

*Default Markets*

```
{
    "startTime": "2013-02-26T00:00:00+00:00",
    "endTime": "2013-02-27T00:00:00+00:00",
    "results": [
        {
            "buy": {
                "baseVolume": 1650,
                "counterVolume": 0.03,
                "count": 2
            },
            "sell": {
                "baseVolume": 1950,
                "counterVolume": 1,
                "count": 1
            },
            "account": "rN6DeCG5VvmfqjBywwoE24oXQsHzRDUfzh",
            "baseVolume": 3600,
            "counterVolume": 1.03,
            "count": 3
        },
        {
            "buy": {
                "baseVolume": 54890.21956,
                "counterVolume": 0.998003991999999,
                "count": 1
            },
            "sell": {
                "baseVolume": 0,
                "counterVolume": 0,
                "count": 0
            },
            "account": "r4EM4gBQfr1QgQLXSPF4r7h84qE9mb6iCC",
            "baseVolume": 54890.21956,
            "counterVolume": 0.998003991999999,
            "count": 1
        },
        {
            "buy": {
                "baseVolume": 43468.68636,
                "counterVolume": 1.66884978,
                "count": 3
            },
            "sell": {
                "baseVolume": 0,
                "counterVolume": 0,
                "count": 0
            },
            "account": "r49nVgaYSDuU7GEQh4mF1nyjsXSVRcUHsr",
            "baseVolume": 43468.68636,
            "counterVolume": 1.66884978,
            "count": 3
        },
        {
            "buy": {
                "baseVolume": 3998,
                "counterVolume": 2,
                "count": 1
            },
            "sell": {
                "baseVolume": 0,
                "counterVolume": 0,
                "count": 0
            },
            "account": "rhdAw3LiEfWWmSrbnZG3udsN7PoWKT56Qo",
            "baseVolume": 3998,
            "counterVolume": 2,
            "count": 1
        },
        {
            "buy": {
                "baseVolume": 0,
                "counterVolume": 0,
                "count": 0
            },
            "sell": {
                "baseVolume": 8200,
                "counterVolume": 0.2,
                "count": 1
            },
            "account": "rGsLivkDjTZHFQ8oV2h81uTcbTpgjEaEY7",
            "baseVolume": 8200,
            "counterVolume": 0.2,
            "count": 1
        },
        {
            "buy": {
                "baseVolume": 1688782.827518,
                "counterVolume": 26.242631108001902,
                "count": 18
            },
            "sell": {
                "baseVolume": 0,
                "counterVolume": 0,
                "count": 0
            },
            "account": "rKQLJpoBagwGiE7LVcY8YfDfE6EUREJjeq",
            "baseVolume": 1688782.827518,
            "counterVolume": 26.242631108001902,
            "count": 18
        },
        {
            "buy": {
                "baseVolume": 3688,
                "counterVolume": 0.071,
                "count": 3
            },
            "sell": {
                "baseVolume": 13608.0998,
                "counterVolume": 0.24950099800399195,
                "count": 4
            },
            "account": "rpuebQXsR7kAst5yidD6fmGmJHD4niXzbo",
            "baseVolume": 17296.0998,
            "counterVolume": 0.320500998003992,
            "count": 7
        },
        {
            "buy": {
                "baseVolume": 153840,
                "counterVolume": 3.2,
                "count": 5
            },
            "sell": {
                "baseVolume": 345998,
                "counterVolume": 8,
                "count": 5
            },
            "account": "rnZoUopPFXRSVGdeDkgbqdft8SbXfJxKYh",
            "baseVolume": 499838,
            "counterVolume": 11.2,
            "count": 10
        },
        {
            "buy": {
                "baseVolume": 0,
                "counterVolume": 0,
                "count": 0
            },
            "sell": {
                "baseVolume": 87300,
                "counterVolume": 1.56,
                "count": 6
            },
            "account": "rMFTySyNbLqyhy391qGL7GHdHWZ5LfvtG",
            "baseVolume": 87300,
            "counterVolume": 1.56,
            "count": 6
        },
        {
            "buy": {
                "baseVolume": 10000,
                "counterVolume": 0.19999999999999996,
                "count": 1
            },
            "sell": {
                "baseVolume": 0,
                "counterVolume": 0,
                "count": 0
            },
            "account": "rnwRcxX4JpHnPjTJpaDH8YZzRPTphvsHbE",
            "baseVolume": 10000,
            "counterVolume": 0.19999999999999996,
            "count": 1
        },
        {
            "buy": {
                "baseVolume": 307790.40518999996,
                "counterVolume": 4.78696007984032,
                "count": 6
            },
            "sell": {
                "baseVolume": 0,
                "counterVolume": 0,
                "count": 0
            },
            "account": "rNnLFDCRrAtuESodmwamAasMBZqCmkqQH9",
            "baseVolume": 307790.40518999996,
            "counterVolume": 4.78696007984032,
            "count": 6
        },
        {
            "buy": {
                "baseVolume": 0,
                "counterVolume": 0,
                "count": 0
            },
            "sell": {
                "baseVolume": 1827449.9996490004,
                "counterVolume": 28.469630993204063,
                "count": 27
            },
            "account": "ramJoEsBUHc299vFuMvn8NgLrF3Qrt3XV4",
            "baseVolume": 1827449.9996490004,
            "counterVolume": 28.469630993204063,
            "count": 27
        },
        {
            "buy": {
                "baseVolume": 800,
                "counterVolume": 0.016000000000000014,
                "count": 1
            },
            "sell": {
                "baseVolume": 0,
                "counterVolume": 0,
                "count": 0
            },
            "account": "rKuuVUKA14roSPTuquQTo7nmWZN8EsfxpT",
            "baseVolume": 800,
            "counterVolume": 0.016000000000000014,
            "count": 1
        },
        {
            "buy": {
                "baseVolume": 4597.960821,
                "counterVolume": 0.06568703136583831,
                "count": 1
            },
            "sell": {
                "baseVolume": 0,
                "counterVolume": 0,
                "count": 0
            },
            "account": "rNHf9nnX4JgHferxjRxmapDev7mWQZ6XXd",
            "baseVolume": 4597.960821,
            "counterVolume": 0.06568703136583831,
            "count": 1
        },
        {
            "buy": {
                "baseVolume": 11000,
                "counterVolume": 0.2,
                "count": 2
            },
            "sell": {
                "baseVolume": 0,
                "counterVolume": 0,
                "count": 0
            },
            "account": "rG8VFQPaJB2gNjx29Et1wKUJettQP1eLmk",
            "baseVolume": 11000,
            "counterVolume": 0.2,
            "count": 2
        }
    ]
}
```

<!-- </div> -->

A successful result contains the following fields:

| Field | Type | Description |
|-------|------|-------------|
| account | String (Account Address) | The account of the trader. |
| buy | Object | Object with `baseVolume` (volume of base currency bought), `counterVolume` (volume of counter currency bought), and `count` (number of buy transactions) fields describing the activity of this account. |
| sell | Object | Object with `baseVolume` (volume of base currency sold), `counterVolume` (volume of counter currency sold), and `count` (number of sell transactions) fields describing the activity of this account. |
| baseVolume | Number | The total amount of the base currency exchanged. |
| counterVolume | Number | The total amount of the counter currency exchanged. |
| count | Number | The number of exchanges this account performed. |
| transactions | Array | (Omitted unless the request specified `transactions` as true) Array of transactions sent that this account participated in. |

If transactions are included, each transaction is represented as an array with the following fields in order:

| Type | Description |
|------|-------------|
| String ([Date-Time][]) | The approximate time this transaction occurred. |
| Number | The amount of the counter currency received for each unit of the base spent. |
| Number | The amount of base currency in this transaction. |
| Number | The amount of counter currency in this transaction. |
| String (Divvy Address) | One party to this transaction. |
| String (Divvy Address) | The other party to this transaction. |
| String (Transaction Hash) | The identifying hash for this transaction. (This may be `null` for very old transactions.) |
| Number | The sequence number of the ledger that included this transaction. |


## Offers ##
[[Source]<br>](https://github.com/xdv/divvy-data-api/blob/develop/api/routes/offers.js "Source")

Returns all currency-exchange orders and cancellations over time for a specified currency pair, including unfulfilled offers.

#### Request Format ####

<!-- <div class='multicode'> -->

*Reduced*

```
POST /api/offers
{
    "base": {
        "currency": "GBP",
        "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
    },
    "counter": {
        "currency": "XDV"
    },
    "startTime": "2015-03-01T10:00:00.000Z",
    "endTime": "2015-03-07T10:00:00.000Z",
    "timeIncrement": "day",
    "descending": false,
    "reduce": true,
    "format": "json"
}
```

*Expanded*

```
POST /api/offers
{
    "base": {
        "currency": "GBP",
        "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
    },
    "counter": {
        "currency": "XDV"
    },
    "startTime": "2015-03-01T10:00:00.000Z",
    "endTime": "2015-03-07T10:00:00.000Z",
    "descending": false,
    "reduce": false,
    "limit": 5,
    "offset": 0,
    "format": "json"
}
```

<!-- </div> -->

[Try it! >](https://xdv.io/build/charts-api-tool/#offers)

The request includes the following body parameters:

| Field | Value | Description |
|-------|-------|-------------|
| base  | Object ([Currency Object][]) | One of the currencies being exchanged. |
| counter | Object ([Currency Object][]) | The other of the currencies being exchanged. |
| startTime | String ([Date-Time][]) | Retrieve information starting at this time. |
| endTime | String ([Date-Time][]) | Retrieve information ending at this time. |
| timeIncrement | String | (Optional) Divide results into intervals of the specified length: `year`, `month`, `day`, `hour`, `minute`, or `second`. The value `all` collapses the results into just one interval. Defaults to `all`. |
| descending | Boolean | (Optional) If true, return results in descending order. Defaults to false. |
| reduce | Boolean | (Optional) If `false`, include transactions individually instead of collapsing them into results over time. Defaults to `true`. Ignored if `timeIncrement` is provided. |
| limit | Number | (Optional) If reduce is `false`, this value defines the maximum number of transactions to return in one response. Use with `offset` to paginate results. Defaults to 500. |
| offset | Number | (Optional) If reduce is `false`, this value defines a number of transactions to skip before returning results. Use with `limit` to paginate results. Defaults to 0. |
| format | String | (Optional) The [Response Format][] to use: `csv` or `json`. If omitted, defaults to a CSV-like JSON array format. |

#### Response Format ####

The format of the response depends on the `format` and `reduce` parameters from the request. See [Response Format][] for details. Examples of successful responses:

<!-- <div class='multicode'> -->

*Reduced*

```
{
    "base": {
        "currency": "GBP",
        "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
    },
    "counter": {
        "currency": "XDV"
    },
    "startTime": "2015-03-01T00:00:00+00:00",
    "endTime": "2015-03-07T00:00:00+00:00",
    "timeIncrement": "day",
    "results": [
        {
            "time": "2015-03-01T00:00:00.000Z",
            "OfferCreate": 14,
            "OfferCancel": 15
        },
        {
            "time": "2015-03-02T00:00:00.000Z",
            "OfferCreate": 7,
            "OfferCancel": 6
        },
        {
            "time": "2015-03-03T00:00:00.000Z",
            "OfferCreate": 23,
            "OfferCancel": 23
        },
        {
            "time": "2015-03-05T00:00:00.000Z",
            "OfferCreate": 0,
            "OfferCancel": 1
        }
    ]
}
```

*Expanded*

```
{
    "base": {
        "currency": "GBP",
        "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
    },
    "counter": {
        "currency": "XDV"
    },
    "startTime": "2015-03-01T00:00:00+00:00",
    "endTime": "2015-03-07T00:00:00+00:00",
    "results": [
        {
            "type": "OfferCancel",
            "account": "rUBLCjWdsPPMkppdFXVJWhHnr3FNqCzgG3",
            "baseAmount": 21244.787159,
            "counterAmount": 170.88055684,
            "price": 124.3253624161118,
            "time": "2015-03-01T01:45:40+00:00",
            "txHash": "C604881B175DEB22EC385BDD823899D35C9634F1686B3879A149704EB5EC0D81",
            "ledgerIndex": 11992359
        },
        {
            "type": "OfferCreate",
            "account": "rUBLCjWdsPPMkppdFXVJWhHnr3FNqCzgG3",
            "baseAmount": 21567.217829,
            "counterAmount": 170.88055684,
            "price": 126.21223986994579,
            "time": "2015-03-01T01:46:50+00:00",
            "txHash": "BBC91163FBD9F51338CFE96F14C3C0622DCA192C39B89BCB99D35549FECA0D4B",
            "ledgerIndex": 11992373
        },
        {
            "type": "OfferCancel",
            "account": "rUBLCjWdsPPMkppdFXVJWhHnr3FNqCzgG3",
            "baseAmount": 21567.217829,
            "counterAmount": 170.88055684,
            "price": 126.21223986994579,
            "time": "2015-03-01T12:10:50+00:00",
            "txHash": "BB0F8E6395CDE8D64B04638CAA3953D74AB791770D8123B39AF8BC0CBE81FEB9",
            "ledgerIndex": 12000709
        },
        {
            "type": "OfferCreate",
            "account": "rUBLCjWdsPPMkppdFXVJWhHnr3FNqCzgG3",
            "baseAmount": 22015.655577,
            "counterAmount": 170.88055684,
            "price": 128.8365158922898,
            "time": "2015-03-01T12:11:40+00:00",
            "txHash": "E0A861F84489E29ED5003913DA57E7EE2BBDDDD6B207E906D8B276F9956316C4",
            "ledgerIndex": 12000721
        },
        {
            "type": "OfferCancel",
            "account": "rUBLCjWdsPPMkppdFXVJWhHnr3FNqCzgG3",
            "baseAmount": 22015.655577,
            "counterAmount": 170.88055684,
            "price": 128.8365158922898,
            "time": "2015-03-01T13:10:50+00:00",
            "txHash": "3EA9920CC8466E2CC50F2DF37D5A43A06B4DC8251E7CB66B015EAC482F0691DD",
            "ledgerIndex": 12001477
        }
    ]
}
```

<!-- </div> -->

**If results are reduced** (the default), then each result represents an interval of time, with the following attributes, in order:

| Field | Type | Description |
|-------|------|-------------|
| time  | String ([Date-Time][]) | The start time of this interval. |
| OfferCreate | Number | The number of [currency-exchange order creation transactions](https://xdv.io/build/transactions#offercreate) in this interval. |
| OfferCancel | Number | The number of [currency-exchange order cancellation transactions](https://xdv.io/build/transactions#offercancel) in this interval. |

**Note:** An `OfferCreate`-type transaction can cancel a previous order in addition to creating a new one.

**If the results are not reduced** (the request used `"reduce":false`), then each result represents an individual transaction, with the following attributes:

| Field | Type | Description |
|-------|------|-------------|
| type  | String | The [type of this transaction](https://xdv.io/build/transactions): `OfferCreate` or `OfferCancel`.
| account | String (Divvy Address) | The account that sent this transaction. |
| baseAmount | Object ([Currency Amount][Currency Object]) | The amount of the base currency exchanged in this transaction. |
| counterAmount | Object ([Currency Amount][Currency Object]) | The amount of the counter currency exchanged in this transaction. |
| price | Number | The amount of counter currency received for each unit of the base currency spent in this transaction. |
| time | String ([Date-Time][]) | The approximate time this transaction occurred. |
| txHash | String (Transaction Hash) | The identifying hash of this transaction. |
| ledgerIndex | Number | The sequence number of the ledger where this transaction occurred. |


## Offers Exercised ##
[[Source]<br>](https://github.com/xdv/divvy-data-api/blob/master/api/routes/offersExercised.js "Source")

Retrieve information about currency-exchange orders being exercised on the network, for a specific pair of currencies and timeframe.

<!-- <div class='multicode'> -->

*15-minute increments*

```
POST /api/offers_exercised
{
    "base": {
        "currency": "USD",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
    },
    "counter": {
        "currency": "BTC",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
    },
    "endTime": "2015-03-01T00:00Z",
    "startTime": "2015-03-01T12:00Z",
    "timeIncrement": "minute",
    "timeMultiple": 15,
    "format": "json"
}
```

*Expanded*

```
POST /api/offers_exercised
{
    "base": {
        "currency": "USD",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
    },
    "counter": {
        "currency": "BTC",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
    },
    "endTime": "2015-03-01T00:00:00.000Z",
    "startTime": "2015-03-01T23:59:00.000Z",
    "reduce": false,
    "limit": 5,
    "offset": 0,
    "format": "json"
}
```

<!-- </div> -->

[Try it! >](https://xdv.io/build/charts-api-tool/#offers-exercised)

The request includes the following body parameters:

| Field | Value | Description |
|-------|-------|-------------|
| base  | Object ([Currency Object][]) | One of the currencies being exchanged. |
| counter | Object ([Currency Object][]) | The other of the currencies being exchanged. |
| startTime | String ([Date-Time][]) | Retrieve information starting at this time. |
| endTime | String ([Date-Time][]) | Retrieve information ending at this time. |
| timeIncrement | String | (Optional) Divide results into intervals of the specified length: `year`, `month`, `day`, `hour`, `minute`, or `second`. The value `all` collapses the results into just one interval. Defaults to `all`. |
| timeMultiple | Number | (Optional) Create larger intervals that are this many times the size of the `timeIncrement` (for example, 15-minute intervals). Defaults to 1. |
| descending | Boolean | (Optional) If true, return results in descending order. Defaults to false. |
| reduce | Boolean | (Optional) If `false`, include transactions individually instead of collapsing them into results over time. Defaults to `true`. Ignored if `timeIncrement` is provided. |
| limit | Number | (Optional) If reduce is `false`, this value defines the maximum number of transactions to return in one response. Use with `offset` to paginate results. Defaults to 500. |
| offset | Number | (Optional) If reduce is `false`, this value defines a number of transactions to skip before returning results. Use with `limit` to paginate results. Defaults to 0. |
| format | String | (Optional) The [Response Format][] to use: `csv` or `json`. If omitted, defaults to a CSV-like JSON array format. |

#### Response Format ####

The format of the response depends on the `format` and `reduce` parameters from the request. See [Response Format][] for details. Examples of successful responses:

<!-- <div class='multicode'> -->

*15-minute increments*

```
{
    "startTime": "2015-03-01T00:00:00+00:00",
    "endTime": "2015-03-01T12:00:00+00:00",
    "base": {
        "currency": "USD",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
    },
    "counter": {
        "currency": "BTC",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
    },
    "timeIncrement": "minutes",
    "timeMultiple": 15,
    "results": [
        {
            "startTime": "2015-03-01T00:45:00+00:00",
            "openTime": "2015-03-01T00:52:20+00:00",
            "closeTime": "2015-03-01T00:52:20+00:00",
            "baseVolume": 683.2001467024601,
            "counterVolume": 2.679229505167318,
            "count": 1,
            "open": 0.0039215880120912015,
            "high": 0.0039215880120912015,
            "low": 0.0039215880120912015,
            "close": 0.0039215880120912015,
            "vwap": 0.003921588012091202,
            "partial": false
        },
        {
            "startTime": "2015-03-01T09:45:00+00:00",
            "openTime": "2015-03-01T09:45:30+00:00",
            "closeTime": "2015-03-01T09:48:40+00:00",
            "baseVolume": 6025.771839536825,
            "counterVolume": 23.67880093810258,
            "count": 43,
            "open": "0.00391389432485323",
            "high": 0.003945508916212113,
            "low": "0.003912889366625167",
            "close": 0.003921642784865358,
            "vwap": 0.003929588037625179,
            "partial": false
        },
        {
            "startTime": "2015-03-01T11:45:00+00:00",
            "openTime": "2015-03-01T11:59:40+00:00",
            "closeTime": "2015-03-01T11:59:40+00:00",
            "baseVolume": 30.990503463384982,
            "counterVolume": 0.12348600141122801,
            "count": 1,
            "open": "0.003984640054561433",
            "high": "0.003984640054561433",
            "low": "0.003984640054561433",
            "close": "0.003984640054561433",
            "vwap": 0.003984640054561414,
            "partial": false
        }
    ]
}
```

*Expanded*

```
{
    "startTime": "2015-03-01T00:00:00+00:00",
    "endTime": "2015-03-01T23:59:00+00:00",
    "base": {
        "currency": "USD",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
    },
    "counter": {
        "currency": "BTC",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
    },
    "timeIncrement": "all",
    "results": [
        {
            "time": "2015-03-01T00:16:20+00:00",
            "price": "0.003926827277291318",
            "baseAmount": 128.95156374260318,
            "counterAmount": 0.506370517953824,
            "account": "rUBLCjWdsPPMkppdFXVJWhHnr3FNqCzgG3",
            "counterparty": "r4rCiFc9jpMeCpKioVJUMbT1hU4kj3XiSt",
            "tx_hash": "7257EC2FB029E76003B771755448334B650E376312B99AEF7F6B8DC85BF50C48",
            "ledgerIndex": 11991162
        },
        {
            "time": "2015-03-01T00:16:50+00:00",
            "price": "0.003928013992378335",
            "baseAmount": 271.64872683,
            "counterAmount": 1.06704,
            "account": "rUBLCjWdsPPMkppdFXVJWhHnr3FNqCzgG3",
            "counterparty": "rBxy23n7ZFbUpS699rFVj1V9ZVhAq6EGwC",
            "tx_hash": "57996435CAF193F427408187F4DE72879E76015E446D78C7C5702D8F193B478F",
            "ledgerIndex": 11991168
        },
        {
            "time": "2015-03-01T00:18:00+00:00",
            "price": "0.003958567143537345",
            "baseAmount": 12.608369653599198,
            "counterAmount": 0.04991107784431131,
            "account": "rDVBvAQScXrGRGnzrxRrcJPeNLeLeUTAqE",
            "counterparty": "r9bf8V4ae5xReYnKPXgnwERDFPoW34FhGy",
            "tx_hash": "5B1AEFDC4AF56843854CACEE885B856273F260F9DA5990600651F06B913136AB",
            "ledgerIndex": 11991181
        },
        {
            "time": "2015-03-01T00:18:00+00:00",
            "price": "0.003958567143537345",
            "baseAmount": 54.95776227293271,
            "counterAmount": 0.21755399201596803,
            "account": "rDVBvAQScXrGRGnzrxRrcJPeNLeLeUTAqE",
            "counterparty": "rfZ4YjC4CyaKFx9cgzYNKk4E2zTXRJif26",
            "tx_hash": "139159A556F7F240078D378F3FCF556D01EF2C99DB79DD84338E7AD71419EEA6",
            "ledgerIndex": 11991181
        },
        {
            "time": "2015-03-01T00:18:00+00:00",
            "price": "0.003958567143537345",
            "baseAmount": 91.90007712981681,
            "counterAmount": 0.3637926258146406,
            "account": "rDVBvAQScXrGRGnzrxRrcJPeNLeLeUTAqE",
            "counterparty": "rEiUs9rEiGHmpaprkYDNyXnJYg4ANxWLy9",
            "tx_hash": "10E7823DFE7B2F4EAD204A5FA212DCE9624FD87AA5B45E29AE21C2BFCC797CD8",
            "ledgerIndex": 11991181
        }
    ]
}
```

<!-- </div> -->

**If results are reduced** (the default), then each result represents an interval of time, with the following attributes, in order:

| Field | Value | Description |
|-------|-------|-------------|
| startTime | String ([Date-Time][]) | The start time of this interval. |
| baseVolume | Number | Total amount of the base currency traded in this interval. |
| counterVolume | Number | Total amount of the counter currency traded in this interval. |
| count | Number | Number of trades in this interval. |
| open | Number | Price of the first trade in this interval. |
| high | Number | Highest price traded in this interval. (Most counter currency received per unit of base currency spent.) |
| low | Number | Lowest price traded in this interval. (Least counter currency received per unit of base currency spent.) |
| close | Number | Price of the last trade in this interval. |
| vwap | Number | [Volume weighted average price](http://en.wikipedia.org/wiki/Volume-weighted_average_price) of trades in this interval. |
| openTime | String ([Date-Time][]) | The time at which the first trade in this interval occurred. |
| closeTime | String ([Date-Time][]) | The time at which the last trade in this interval occurred. |
| partial | Boolean | If true, this row may not include all trades in the interval due to the alignment of the requested time period. For example, a time interval of 1 minute was requested, but the end time for the range was 3:45:30. |

All prices are represented as the amount of the counter currency received for each unit of the base-currency spent.

The time of an exchange is defined as the close time of the ledger that contained the transaction exercising the exchange.

Note: The API omits intervals during which no exchanges occurred. This means that the rows may not be sequential. (They _are_ in order, but with gaps for empty intervals.)

**If the results are not reduced** (the request used `"reduce":false`), then each result represents an individual transaction that caused a currency exchange, with the following attributes:

| Field | Value | Description |
|-------|-------|-------------|
| time  | String ([Date-Time][]) | The time this transaction occurred, as defined by the close time of the ledger that included it. |
| price | Number | The amount of the counter currency received for each unit of the base-currency spent in this trade. |
| baseAmount | Number | Total amount of the base currency spent in this trade. |
| counterAmount | Number | Total amount of the counter currency received in this trade. |
| account | String | The Divvy address of the account providing the base currency. |
| counterparty | String (Divvy Address) | The Divvy address of the account providing the counter currency. |
| tx_hash | String (Transaction Hash) | The identifying hash of the transaction where this transaction occurred. |
| ledgerIndex | Number | The sequence number of the ledger that included this transaction. |


## Top Markets ##
[[Source]<br>](https://github.com/xdv/divvy-data-api/blob/develop/api/routes/totalTradeVolume.js "Source")

Returns the total trade volume for [a selection of the largest currency-exchange markets in the Divvy Network](https://github.com/xdv/divvy-data-api/blob/develop/api/library/metrics/tradeVolume.js) during a given time period.

The total volume is normalized in terms of XDV and then optionally converted to another specified currency.

#### Request Format ####

<!-- <div class='multicode'> -->

*Request*

```
POST /api/top_markets
{
    "startTime": "2015-01-07T00:00:00.000Z",
    "interval": "week",
    "exchange": {
        "currency": "USD",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
    }
}
```

<!-- </div> -->

[Try it! >](https://xdv.io/build/charts-api-tool/#top-markets)

The request includes the following body parameters:

| Field | Value | Description |
|-------|-------|-------------|
| startTime | String ([Date-Time][]) | Retrieve information from the interval containing or starting from this time. Defaults to 24 hours before the current time. |
| interval | String | Return results from an interval of this length. |
| exchange | Object ([Currency Object][]) | (Optional) Represent the volume of each market in terms of this currency. Defaults to XDV. |

#### Response Format ####

An example of a successful response:

```js
{
  "rowkey": "trade_volume|week|20150105000000",
  "components": [
    {
      "base": {
        "currency": "USD",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
      },
      "counter": {
        "currency": "XDV"
      },
      "rate": 0.0004093940882798027,
      "count": 12818,
      "amount": 1058808.8475284327,
      "convertedAmount": 1058808.8475284327
    },
    {
      "base": {
        "currency": "BTC",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
      },
      "counter": {
        "currency": "XDV"
      },
      "rate": 0.0000015089406113337684,
      "count": 5038,
      "amount": 1211.8976720489186,
      "convertedAmount": 328802.69694533286
    },
    {
      "base": {
        "currency": "CNY",
        "issuer": "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK"
      },
      "counter": {
        "currency": "XDV"
      },
      "rate": 0.002517187670715517,
      "count": 5792,
      "amount": 1886016.212859644,
      "convertedAmount": 306740.69197435805
    },
    {
      "base": {
        "currency": "CNY",
        "issuer": "razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA"
      },
      "counter": {
        "currency": "XDV"
      },
      "rate": 0.002487380215448072,
      "count": 7069,
      "amount": 2631245.752126516,
      "convertedAmount": 433072.6959400096
    },
    {
      "base": {
        "currency": "CNY",
        "issuer": "rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y"
      },
      "counter": {
        "currency": "XDV"
      },
      "rate": 0.0024999228710402563,
      "count": 20660,
      "amount": 1318591.835624731,
      "convertedAmount": 215936.1429155409
    },
    {
      "base": {
        "currency": "USD",
        "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
      },
      "counter": {
        "currency": "XDV"
      },
      "rate": 0.0003945533232038895,
      "count": 33575,
      "amount": 1480087.1064381741,
      "convertedAmount": 1535759.2393204158
    },
    {
      "base": {
        "currency": "EUR",
        "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
      },
      "counter": {
        "currency": "XDV"
      },
      "rate": 0.00033245421053307723,
      "count": 13892,
      "amount": 326411.42570749344,
      "convertedAmount": 401952.82176561374
    },
    {
      "base": {
        "currency": "BTC",
        "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
      },
      "counter": {
        "currency": "XDV"
      },
      "rate": 0.0000014787515510977754,
      "count": 22939,
      "amount": 5535.83428387394,
      "convertedAmount": 1532602.165544437
    },
    {
      "base": {
        "currency": "BTC",
        "issuer": "rJHygWcTLVpSXkowott6kzgZU6viQSVYM1"
      },
      "counter": {
        "currency": "XDV"
      },
      "rate": 0.00002019256666183595,
      "count": 4,
      "amount": 0.00008287404598700001,
      "convertedAmount": 0.0016802294164530685
    },
    {
      "base": {
        "currency": "JPY",
        "issuer": "rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6"
      },
      "counter": {
        "currency": "XDV"
      },
      "rate": 0.048446318835714555,
      "count": 11387,
      "amount": 90721573.94254778,
      "convertedAmount": 766639.7972870923
    },
    {
      "base": {
        "currency": "JPY",
        "issuer": "r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN"
      },
      "counter": {
        "currency": "XDV"
      },
      "rate": 0.049622732367643606,
      "count": 7604,
      "amount": 97770194.62368087,
      "convertedAmount": 806617.0035207476
    },
    {
      "base": {
        "currency": "JPY",
        "issuer": "rJRi8WW24gt9X85PHAxfWNPCizMMhqUQwg"
      },
      "counter": {
        "currency": "XDV"
      },
      "rate": 0.04957853568065961,
      "count": 650,
      "amount": 21241310.716636248,
      "convertedAmount": 175399.8361451728
    },
    {
      "base": {
        "currency": "KRW",
        "issuer": "rUkMKjQitpgAM5WTGk79xpjT38DEJY283d"
      },
      "counter": {
        "currency": "XDV"
      },
      "rate": 0.45875087906923134,
      "count": 3309,
      "amount": 643024533.754439,
      "convertedAmount": 573841.8273378739
    },
    {
      "base": {
        "currency": "EUR",
        "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
      },
      "counter": {
        "currency": "USD",
        "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
      },
      "rate": 0.00033245421053307723,
      "count": 4408,
      "amount": 89233.81725732498,
      "convertedAmount": 109885.19953232592
    },
    {
      "base": {
        "currency": "BTC",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
      },
      "counter": {
        "currency": "USD",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
      },
      "rate": 0.0000015089406113337684,
      "count": 1135,
      "amount": 308.8960869071788,
      "convertedAmount": 83807.29561038432
    },
    {
      "base": {
        "currency": "BTC",
        "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
      },
      "counter": {
        "currency": "USD",
        "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
      },
      "rate": 0.0000014787515510977754,
      "count": 5705,
      "amount": 1097.9447905182549,
      "convertedAmount": 303967.29333071
    },
    {
      "base": {
        "currency": "BTC",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
      },
      "counter": {
        "currency": "BTC",
        "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
      },
      "rate": 0.0000015089406113337684,
      "count": 1855,
      "amount": 588.0555584971066,
      "convertedAmount": 159546.6828982718
    },
    {
      "base": {
        "currency": "USD",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
      },
      "counter": {
        "currency": "USD",
        "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
      },
      "rate": 0.0004093940882798027,
      "count": 3623,
      "amount": 536607.4024021383,
      "convertedAmount": 536607.4024021383
    },
    {
      "base": {
        "currency": "CNY",
        "issuer": "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK"
      },
      "counter": {
        "currency": "USD",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
      },
      "rate": 0.002517187670715517,
      "count": 871,
      "amount": 426317.9599118283,
      "convertedAmount": 69336.13037513298
    },
    {
      "base": {
        "currency": "CNY",
        "issuer": "razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA"
      },
      "counter": {
        "currency": "USD",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
      },
      "rate": 0.002487380215448072,
      "count": 833,
      "amount": 415914.584286911,
      "convertedAmount": 68454.74245510166
    },
    {
      "base": {
        "currency": "JPY",
        "issuer": "rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6"
      },
      "counter": {
        "currency": "USD",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
      },
      "rate": 0.048446318835714555,
      "count": 441,
      "amount": 2687850.8059423557,
      "convertedAmount": 22713.59840285114
    },
    {
      "base": {
        "currency": "JPY",
        "issuer": "rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6"
      },
      "counter": {
        "currency": "USD",
        "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"
      },
      "rate": 0.048446318835714555,
      "count": 5186,
      "amount": 27619591.096972037,
      "convertedAmount": 233398.48284757807
    },
    {
      "base": {
        "currency": "JPY",
        "issuer": "rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6"
      },
      "counter": {
        "currency": "CNY",
        "issuer": "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK"
      },
      "rate": 0.048446318835714555,
      "count": 1008,
      "amount": 7269403.650447986,
      "convertedAmount": 61429.86611439055
    },
    {
      "base": {
        "currency": "JPY",
        "issuer": "rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6"
      },
      "counter": {
        "currency": "JPY",
        "issuer": "r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN"
      },
      "rate": 0.048446318835714555,
      "count": 2852,
      "amount": 26542137.8118745,
      "convertedAmount": 224293.4978679679
    }
  ],
  "count": 172654,
  "endTime": "2015-01-12T00:00:00+00:00",
  "exchange": {
    "currency": "USD",
    "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
  },
  "exchangeRate": 0.020233489275945527,
  "startTime": "2015-01-05T00:00:00+00:00",
  "total": 10009613.959742112
}
```

A successful result contains the following fields:

| Field | Type | Description |
|-------|------|-------------|
| startTime | Object ([Date-Time][]) | The starting time from the request. |
| endTime | Object ([Date-Time][]) | The ending time from the request. |
| exchange | Object ([Currency Object][]) | The currency from the request that is used to express the volume. |
| exchangeRate | Number | The amount of the `exchange` currency that can be bought for 1 XDV. |
| total | Number | The total volume traded across all markets, in terms of the `exchange` currency. |
| count | Number | The total number of trades in all the markets. |
| components | Array | The market volumes of each market in the list of top markets. |

Each member of the `components` array has the following fields:

| Field | Type | Description |
|-------|------|-------------|
| base  | Object ([Currency Object][]) | One of the currencies that defines this market. |
| counter | Object ([Currency Object][]) | The other currency that defines this market. |
| rate  | Number | The amount of the `exchange` currency necessary to buy 1 unit of the `base` currency. |
| count | Number | The number of trades in this market during the requested time period. |
| amount | Number | Total amount of the base currency traded in this market during the requested time period. |
| convertedAmount | Number | Total amount of currency traded in this market during the requested time period, in terms of the `exchange` currency. |

**Note:** If there are no trades in a market during the requested period, the `rate` is defined as 0.


## Total Network Value ##
[[Source]<br>](https://github.com/xdv/divvy-data-api/blob/develop/api/routes/totalNetworkValue.js "Source")

Retrieve the total amount of currency held in the network, as of a specified time.

#### Request Format ####

<!-- <div class='multicode'> -->

*Request*

```
POST /api/total_network_value
{
    "time": "2014-12-24T00:00:00.000Z",
    "exchange":{
        "currency": "USD",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
    }
}
```

<!-- </div> -->

[Try it! >](https://xdv.io/build/charts-api-tool/#total-network-value)

The request includes the following body parameters:

| Field | Value | Description |
|-------|-------|-------------|
| time  | Object ([Date-Time][]) | (Optional) Calculate results at this point in time. Defaults to the current time. |
| exchange | Object ([Currency Object][]) | (Optional) Express the total network value in terms of this currency. Defaults to XDV. |

#### Response Format ####

An example of a successful response:

```js
{
    "time": "2014-12-24T00:00:00+00:00",
    "exchange": {
        "currency": "USD",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
    },
    "exchangeRate": 0.02390745076867089,
    "total": 2403965823.842066,
    "components": [
        {
            "currency": "USD",
            "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            "name": "Bitstamp",
            "hotwallets": [
                "rrpNnNLKrartuEqfJGpqyDwPj1AFPg9vn1",
                "rGFuMiw48HdbnrUbkRYuitXTmfrDBNTCnX"
            ],
            "amount": 2646521.4813476186,
            "rate": 1,
            "convertedAmount": 2646521.4813476186
        },
        {
            "currency": "USD",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "name": "SnapSwap",
            "hotwallets": [
                "ra7JkEzrgeKHdzKgo4EUUVBnxggY4z37kt",
                "rQsAshmCjPsxkYnxY9GnmBTAeEUaePDAie",
                "rEk9i7G8ac1kUs1mFjtze1qjj9FzGvXAG",
                "rsTQ7iwrCik9Ugc3zbpcbo2K3SbAdYJss1",
                "rwm98fCBS8tV1YB8CGho8zUPW5J7N41th2",
                "rnd8KJ4qeip6FPJvC1fyv82nW2Lm8C8KjQ",
                "r5ymZSvtdNgbKVc8ay1Jhmq5f9QgnvEtj"
            ],
            "amount": 3423391.3201022753,
            "rate": 1.0133549934987702,
            "convertedAmount": 3469110.688925987
        },
        {
            "currency": "BTC",
            "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            "name": "Bitstamp",
            "hotwallets": [
                "rrpNnNLKrartuEqfJGpqyDwPj1AFPg9vn1",
                "rGFuMiw48HdbnrUbkRYuitXTmfrDBNTCnX"
            ],
            "amount": 4618.960079657584,
            "rate": 339.1489364416104,
            "convertedAmount": 1566515.3984821255
        },
        {
            "currency": "BTC",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "name": "SnapSwap",
            "hotwallets": [
                "ra7JkEzrgeKHdzKgo4EUUVBnxggY4z37kt",
                "rQsAshmCjPsxkYnxY9GnmBTAeEUaePDAie",
                "rEk9i7G8ac1kUs1mFjtze1qjj9FzGvXAG",
                "rsTQ7iwrCik9Ugc3zbpcbo2K3SbAdYJss1",
                "rwm98fCBS8tV1YB8CGho8zUPW5J7N41th2",
                "rnd8KJ4qeip6FPJvC1fyv82nW2Lm8C8KjQ",
                "r5ymZSvtdNgbKVc8ay1Jhmq5f9QgnvEtj"
            ],
            "amount": 4553.083622174116,
            "rate": 335.89151565461424,
            "convertedAmount": 1529342.1587542647
        },
        {
            "currency": "BTC",
            "issuer": "rJHygWcTLVpSXkowott6kzgZU6viQSVYM1",
            "name": "Justcoin",
            "hotwallets": [],
            "amount": 214.02645083481798,
            "rate": 289.21948875946936,
            "convertedAmount": 61900.62069144976
        },
        {
            "currency": "EUR",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "name": "SnapSwap",
            "hotwallets": [
                "ra7JkEzrgeKHdzKgo4EUUVBnxggY4z37kt",
                "rQsAshmCjPsxkYnxY9GnmBTAeEUaePDAie",
                "rEk9i7G8ac1kUs1mFjtze1qjj9FzGvXAG",
                "rsTQ7iwrCik9Ugc3zbpcbo2K3SbAdYJss1",
                "rwm98fCBS8tV1YB8CGho8zUPW5J7N41th2",
                "rnd8KJ4qeip6FPJvC1fyv82nW2Lm8C8KjQ",
                "r5ymZSvtdNgbKVc8ay1Jhmq5f9QgnvEtj"
            ],
            "amount": 377998.6458813907,
            "rate": 1.2709529373414195,
            "convertedAmount": 480418.4892940326
        },
        {
            "currency": "CNY",
            "issuer": "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK",
            "name": "divvyCN",
            "hotwallets": [
                "rNaptDNfFXo1quhKwMaNPf66iwPqA8YLky",
                "rno91tGDJeRcnM7EMXj8KG9UTyxRGMMz8s"
            ],
            "amount": 4654048.165312849,
            "rate": 0.1618097193244357,
            "convertedAmount": 753070.227351677
        },
        {
            "currency": "CNY",
            "issuer": "razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA",
            "name": "DivvyChina",
            "hotwallets": [
                "r45dBj4S3VvMMYXxr9vHX4Z4Ma6ifPMCkK"
            ],
            "amount": 2233083.979247972,
            "rate": 0.1586128864797496,
            "convertedAmount": 354195.8957002061
        },
        {
            "currency": "CNY",
            "issuer": "rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y",
            "name": "Divvy Fox",
            "hotwallets": [
                "rLSnkKvMfPD9abLoQFxQJMYyZqJcsqkL3o",
                "rPcQaiyDxMwLr7Q9eFmn5VnVx2RN57MUmN",
                "r3ipidkRUZWq8JYVjnSnNMf3v7o69vgLEW"
            ],
            "amount": 854758.6787252785,
            "rate": 0.16085453749001152,
            "convertedAmount": 137491.811931928
        },
        {
            "currency": "JPY",
            "issuer": "rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6",
            "name": "Divvy Trade Japan",
            "hotwallets": [
                "r3bStftDydy4dKEUBc9YMabTTk98uZzMpF"
            ],
            "amount": 61129214.7353749,
            "rate": 0.007831461299902996,
            "convertedAmount": 478731.07949354843
        },
        {
            "currency": "JPY",
            "issuer": "r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN",
            "name": "TokyoJPY",
            "hotwallets": [],
            "amount": 175691868.2021911,
            "rate": 0.008018224568263696,
            "convertedAmount": 1408736.8540629558
        },
        {
            "currency": "JPY",
            "issuer": "rJRi8WW24gt9X85PHAxfWNPCizMMhqUQwg",
            "name": "Divvy Market Japan",
            "hotwallets": [],
            "amount": 29743906.757837094,
            "rate": 0.007931783750900699,
            "convertedAmount": 235922.23631011773
        },
        {
            "currency": "XAU",
            "issuer": "r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH",
            "name": "Divvy Singapore",
            "hotwallets": [
                "rL4A1qbTkrJXT644gyzmLVk6uudyMagJ9Q"
            ],
            "amount": 52.747091158245624,
            "rate": 0,
            "convertedAmount": 0
        },
        {
            "currency": "XAU",
            "issuer": "rrh7rf1gV2pXAoqA8oYbpHd8TKv5ZQeo67",
            "name": "GBI",
            "hotwallets": [],
            "amount": 0,
            "rate": 0,
            "convertedAmount": 0
        },
        {
            "currency": "KRW",
            "issuer": "rUkMKjQitpgAM5WTGk79xpjT38DEJY283d",
            "name": "Pax Moneta",
            "hotwallets": [
                "rhLSigWL4J9JBBW1JFMBvaduDkVghG7cc2"
            ],
            "amount": 135974484.5037933,
            "rate": 0.0008632373432934944,
            "convertedAmount": 117378.25275875695
        },
        {
            "currency": "XDV",
            "amount": 99999222492.58995,
            "rate": 0.02390745076867089,
            "convertedAmount": 2390726488.646961
        }
    ]
}
```

A successful result contains the following fields:

| Field | Type | Description |
|-------|------|-------------|
| time  | Object ([Date-Time][]) | Values are calculated for this time, from the request. |
| exchange | Object ([Currency Object][]) | Values are expressed in this currency, from the request. |
| exchangeRate | Number | The amount of the `exchange` currency necessary to buy 1 XDV. |
| total | Number | The total value of all currency issued by [a selection of large gateways](https://github.com/xdv/divvy-data-api/blob/develop/api/library/metrics/networkValue.js), and all XDV in the network (including including XDV that is [held in reserve by xdv.io](https://xdv.io/xdv-distribution/)). |
| components | Array | A list of the gateways and XDV that contributed to the `total` value. |

Each member of the `components` array is an object representing a currency issued by a specific gateway, except for one member that represents the XDV native to the network. Each object has the following properties:

| Field | Type | Description |
|-------|------|-------------|
| currency | String | Currency code for this currency. |
| issuer | String (Divvy Address) | (Omitted for XDV) The Divvy account of the gateway issuing this currency. |
| name | String | (Omitted for XDV) The name of the gateway issuing this currency. |
| hotwallets | Array of Strings | (Omitted for XDV) Each member of this list is the Divvy Address of an account that the gateway uses as a hot wallet. |
| amount | Number | The total amount of this currency issued as of the requested time. |
| rate | Number | The amount of the `exchange` currency necessary to buy 1 unit of this currency. (This is `0` if no amount exists at the time.) |
| convertedAmount | Number | The total amount of this currency issued as of the requested time, converted to the `exchange` currency. |

## Total Value Sent ##
[[Source]<br>](https://github.com/xdv/divvy-data-api/blob/develop/api/routes/totalValueSent.js "Source")

The total amount of money sent, in payments and currency exchanges, for a [curated list of currencies and issuers](https://github.com/xdv/divvy-data-api/blob/develop/api/library/metrics/transactionVolume.js). Results are normalized to a single currency.

#### Request Format ####

<!-- <div class='multicode'> -->

*Request*

```
POST /api/total_value_sent
{
    "startTime": "2015-01-01T00:00:00.000Z",
    "interval": "month",
    "exchange": {
        "currency": "USD",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
    }
}
```

<!-- </div> -->

[Try it! >](https://xdv.io/build/charts-api-tool/#total-value-sent)

The request includes the following body parameters:

| Field | Value | Description |
|-------|-------|-------------|
| startTime | String ([Date-Time][]) | (Optional) Retrieve information from the interval containing or starting at this time. Defaults to 24 hours before the current time. |
| interval | String | Retrieve information for an interval of this length. Valid values are `month`, `week`, or `day`. |
| exchange | Object ([Currency Object][]) | (Optional) Represent the volume of each market in terms of this currency. Defaults to XDV. |

#### Response Format ####

An example of a successful response:

```js
{
    "rowkey": "transaction_volume|month|20150101000000",
    "components": [
        {
            "currency": "USD",
            "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            "amount": 9066039.197471142,
            "count": 49673,
            "rate": 1,
            "convertedAmount": 9066039.197471142
        },
        {
            "currency": "BTC",
            "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
            "amount": 12322.744400761932,
            "count": 26449,
            "rate": 249.97360755383627,
            "convertedAmount": 3080360.872822297
        },
        {
            "currency": "BTC",
            "issuer": "rJHygWcTLVpSXkowott6kzgZU6viQSVYM1",
            "amount": 2.0750693782824463,
            "count": 19,
            "rate": 206.3432067399226,
            "convertedAmount": 428.1764697226175
        },
        {
            "currency": "USD",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "amount": 24169595.842277594,
            "count": 121079,
            "rate": 1.0045601252681042,
            "convertedAmount": 24279812.22699783
        },
        {
            "currency": "BTC",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "amount": 119295.11119032024,
            "count": 115273,
            "rate": 247.6297232015663,
            "convertedAmount": 29541015.363359075
        },
        {
            "currency": "EUR",
            "issuer": "rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q",
            "amount": 12161779.117053518,
            "count": 34018,
            "rate": 1.202596674172229,
            "convertedAmount": 14625715.118185826
        },
        {
            "currency": "CNY",
            "issuer": "rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK",
            "amount": 14402245.292370766,
            "count": 38738,
            "rate": 0.15857204600050093,
            "convertedAmount": 2283793.5030123154
        },
        {
            "currency": "CNY",
            "issuer": "razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA",
            "amount": 17882680.39132861,
            "count": 42097,
            "rate": 0.16168366526106312,
            "convertedAmount": 2891337.310362152
        },
        {
            "currency": "CNY",
            "issuer": "rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y",
            "amount": 24416254.92038198,
            "count": 134038,
            "rate": 0.16425884742617405,
            "convertedAmount": 4010585.8916855953
        },
        {
            "currency": "JPY",
            "issuer": "rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6",
            "amount": 1193425912.8648715,
            "count": 61429,
            "rate": 0.008080112652674486,
            "convertedAmount": 9643015.818569047
        },
        {
            "currency": "JPY",
            "issuer": "r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN",
            "amount": 561857294.1293701,
            "count": 39508,
            "rate": 0.008252613589614441,
            "convertedAmount": 4636791.140956038
        },
        {
            "currency": "JPY",
            "issuer": "rJRi8WW24gt9X85PHAxfWNPCizMMhqUQwg",
            "amount": 214582946.10751072,
            "count": 1181,
            "rate": 0.008380754739008903,
            "convertedAmount": 1798367.0425010128
        },
        {
            "currency": "KRW",
            "issuer": "rUkMKjQitpgAM5WTGk79xpjT38DEJY283d",
            "amount": 6893715627.324748,
            "count": 12289,
            "rate": 0.0008985058881862472,
            "convertedAmount": 6194044.082632835
        },
        {
            "currency": "XDV",
            "amount": 8211627045.779512,
            "count": 1052459,
            "rate": 0.017264153697157482,
            "convertedAmount": 141766791.42207274
        }
    ],
    "count": 1728250,
    "endTime": "2015-02-01T00:00:00+00:00",
    "exchange": {
        "currency": "USD",
        "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B"
    },
    "exchangeRate": 0.017264153697157482,
    "startTime": "2015-01-01T00:00:00+00:00",
    "total": 253818097.16709763
}
```

A successful result contains the following fields:

| Field | Type | Description |
|-------|------|-------------|
| startTime | Object ([Date-Time][]) | The starting time from the request. |
| endTime | Object ([Date-Time][]) | The ending time from the request. |
| exchange | Object ([Currency Object][]) | Totals are normalize to this currency from the request. |
| exchangeRate | Number | The amount of the `exchange` currency necessary to buy 1 XDV. |
| total | Number | The total value sent in the network, normalized to the `exchange` currency, during the requested time period. |
| count | Number | The number of transactions processed to calculate this result. |
| components | Array | An array of the currencies used to calculate this total. |

Each member of the `components` array is an Object with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| currency | String | Currency code for this currency. |
| issuer | String (Divvy Address) | (Omitted for XDV) The Divvy account of the gateway issuing this currency. |
| amount | Number | The total amount of this currency sent during the requested time period. |
| count | Number | The total number of transactions that sent this currency during the requested time period. |
| rate | Number | The amount of the `exchange` currency necessary to buy 1 unit of this currency. (This is 0 if there are no transactions for this currency in the requested time period.) |
| convertedAmount | Number | The total amount of this currency sent during the requested time period, converted to the `exchange` currency. |

## Transaction Stats ##
[[Source]<br>](https://github.com/xdv/divvy-data-api/blob/develop/api/routes/transactionStats.js "Source")

Retrieve information about Divvy transactions during a specific time frame.

#### Request Format ####

<!-- <div class='multicode'> -->

*Reduced*

```
POST /api/transaction_stats
{
    "startTime": "2015-01-15T10:00:00.000Z",
    "endTime": "2015-01-15T07:00:00.000Z",
    "timeIncrement": "hour",
    "descending": false,
    "reduce": true,
    "format": "json"
}
```

*Expanded*

```
POST /api/transaction_stats
{
    "startTime": "2015-01-15 07:00 Z",
    "endTime": "2015-01-15 07:59 Z",
    "descending": true,
    "reduce": false,
    "limit": 10,
    "offset": 0,
    "format": "json"
}
```

<!-- </div> -->

[Try it! >](https://xdv.io/build/charts-api-tool/#transaction-stats)

The request includes the following body parameters:

| Field | Value | Description |
|-------|-------|-------------|
| startTime | String ([Date-Time][]) | Retrieve information starting at this time. |
| endTime | String ([Date-Time][]) | Retrieve information ending at this time. |
| timeIncrement | String | (Optional) Divide results into intervals of the specified length: `year`, `month`, `day`, `hour`, `minute`, or `second`. The value `all` collapses the results into just one interval. Defaults to `all`. |
| descending | Boolean | (Optional) If true, return results in descending order. Defaults to false. |
| reduce | Boolean | (Optional) If `false`, include transactions individually instead of collapsing them into results over time. Ignored if `timeIncrement` is provided. Defaults to `true`. |
| limit | Number | (Optional) If reduce is `false`, this value defines the maximum number of transactions to return in one response. Use with `offset` to paginate results. Defaults to 500. |
| offset | Number | (Optional) If reduce is `false`, this value defines a number of transactions to skip before returning results. Use with `limit` to paginate results. Defaults to 0. |
| format | String | (Optional) The [Response Format][] to use: `csv` or `json`. If omitted, defaults to a CSV-like JSON array format. |

#### Response Format ####

The format of the response depends on the `format` and `reduce` parameters from the request. See [Response Format][] for details. Examples of successful responses:

<!-- <div class='multicode'> -->

*Reduced*

```
{
    "startTime": "2015-01-15T07:00:00+00:00",
    "endTime": "2015-01-15T10:00:00+00:00",
    "timeIncrement": "hour",
    "results": [
        {
            "OfferCancel": 3843,
            "OfferCreate": 12593,
            "TrustSet": 24,
            "Payment": 2686,
            "AccountSet": 139,
            "time": "2015-01-15T07:00:00+00:00"
        },
        {
            "OfferCancel": 4680,
            "OfferCreate": 12836,
            "Payment": 3484,
            "AccountSet": 153,
            "TrustSet": 32,
            "time": "2015-01-15T08:00:00+00:00"
        },
        {
            "OfferCancel": 3996,
            "OfferCreate": 10659,
            "Payment": 1527,
            "AccountSet": 133,
            "TrustSet": 24,
            "time": "2015-01-15T09:00:00+00:00"
        },
        {
            "OfferCancel": 14,
            "OfferCreate": 26,
            "Payment": 3,
            "time": "2015-01-15T10:00:00+00:00"
        }
    ]
}
```

*Expanded*

```
{
    "startTime": "2015-01-15T07:59:00+00:00",
    "endTime": "2015-01-15T07:00:00+00:00",
    "results": [
        {
            "time": "2015-01-15T07:59:00+00:00",
            "type": "OfferCancel",
            "account": "rEepZ4ok2UWuvBedU54XjfjxeiePexxEsq",
            "txHash": "3C32492DBB8D8CF3E605EA76EDFB9EF6FD80F7BAE7DF939CDEBC245CD7B4DBC8",
            "ledgerIndex": 11130426
        },
        {
            "time": "2015-01-15T07:59:00+00:00",
            "type": "OfferCancel",
            "account": "rHsZHqa5oMQNL5hFm4kfLd47aEMYjPstpg",
            "txHash": "054D836321179C5BEECB0CF08A2880BE235088B527AFB5ED249AE35FDECDAAEC",
            "ledgerIndex": 11130426
        },
        {
            "time": "2015-01-15T07:59:00+00:00",
            "type": "OfferCancel",
            "account": "rhUWKrgoGztYKxbuaZMeLc3PdviRrCpdhz",
            "txHash": "44785B97D4E5FE72AFAD0E536D477402D86D9583143A3F0CE5A7AFD65FAF22B9",
            "ledgerIndex": 11130426
        },
        {
            "time": "2015-01-15T07:59:00+00:00",
            "type": "OfferCancel",
            "account": "rhUWKrgoGztYKxbuaZMeLc3PdviRrCpdhz",
            "txHash": "952B9371F38EB027A9DB7D75F5E5DD5141B6D753C2EB3B6101BE62AE13814B8E",
            "ledgerIndex": 11130426
        },
        {
            "time": "2015-01-15T07:59:00+00:00",
            "type": "OfferCreate",
            "account": "r3cS9gS86hjwLwb6rg2usGcXYxwcrvJwBH",
            "txHash": "D44BFB81C585272AA633D70C16F200C9E08D0544C8FE430B42E93DB529CCF397",
            "ledgerIndex": 11130426
        },
        {
            "time": "2015-01-15T07:59:00+00:00",
            "type": "OfferCreate",
            "account": "rBSZe33F5oxHTbxSF1nZJooVDpcrrqNFp3",
            "txHash": "7E48425E313E56F3CF4CD8B8995CA9AAEADA52A0559EDD5703DD899109A57135",
            "ledgerIndex": 11130426
        },
        {
            "time": "2015-01-15T07:59:00+00:00",
            "type": "OfferCreate",
            "account": "rBSZe33F5oxHTbxSF1nZJooVDpcrrqNFp3",
            "txHash": "C53FCCA0C53C39FAFA95B754268635B8187AEB80D6DDC74AAB9DCBFE4B07C664",
            "ledgerIndex": 11130426
        },
        {
            "time": "2015-01-15T07:59:00+00:00",
            "type": "OfferCreate",
            "account": "rGFpans8aW7XZNEcNky6RHKyEdLvXPMnUn",
            "txHash": "716971CA2C2168EF4C06BA4408F27E6FB519148F52154B5CADA29A083E7A0B96",
            "ledgerIndex": 11130426
        },
        {
            "time": "2015-01-15T07:59:00+00:00",
            "type": "OfferCreate",
            "account": "rJnZ4YHCUsHvQu7R6mZohevKJDHFzVD6Zr",
            "txHash": "0A57DFB995947FF8E87324B903D8E25917B3E0C09F4C24F93132AECDC7849362",
            "ledgerIndex": 11130426
        },
        {
            "time": "2015-01-15T07:59:00+00:00",
            "type": "OfferCreate",
            "account": "rJnZ4YHCUsHvQu7R6mZohevKJDHFzVD6Zr",
            "txHash": "17AC61741060D5561D813ABFEFA1A7939273CAA21A7B329CBBFC562EBFE98DB9",
            "ledgerIndex": 11130426
        }
    ]
}
```

<!-- </div> -->

*Note:* In JSON format, the `startTime` and `endTime` parameters at the top level are switched when the request specifies `"descending": true`. This is a bug. See [RD-110](https://divvylabs.atlassian.net/browse/RD-110) for more details.

**If the results are reduced** (the default), then each result represents an interval of time, with the following attributes:

| Field | Type | Description |
|-------|------|-------------|
| time | String ([Date-Time][]) | The time at which this interval begins. |
| Payment | Number | (May be omitted) The number of Payment transactions during this interval sent by the specified account. |
| OfferCreate | Number | (May be omitted) The number of OfferCreate transactions during this interval sent by the specified account. |
| OfferCancel | Number | (May be omitted) The number of OfferCancel transactions during this interval sent by the specified account. |
| TrustSet | Number | (May be omitted) The number of TrustSet transactions during this interval sent by the specified account. |
| AccountSet | Number | (May be omitted) The number of AccountSet transactions during this interval sent by the specified account. |
| SetFee | Number | (May be omitted) The number of SetFee pseudo-transactions during this interval sent by the specified account. Since SetFee is a pseudo-transaction, this transaction type only appears for [ACCOUNT_ZERO](https://wiki.xdv.io/Accounts#ACCOUNT_ZERO). |
| SetRegularKey |  Number | (May be omitted) The number of SetRegularKey transactions during this interval sent by the specified account. |

Each of the transaction type attributes is omitted when there is no data. In CSV or array format, columns are included for each type that has a nonzero value in any interval. In JSON format, each interval includes fields only for the types that have nonzero values in that particular interval.

**If the results are not reduced** (the request used `"reduce": false`), then each result represents an individual transaction, with the following attributes, in order:

| Field | Type | Description |
|-------|------|-------------|
| time | String ([Date-Time][]) | The time this transaction occurred. |
| type | String | The transaction type. Valid types are: `AccountSet`, `OfferCancel`, `OfferCreate`, `Payment`, `SetFee`, `SetRegularKey`, and `TrustSet` |
| account | String (Divvy Address) | The address of the account that sent this transaction. |
| txHash | String (Transaction Hash) | The identifying hash of this transaction. |
| ledgerIndex | Number (Ledger Index) | The identifying sequence number of the ledger that included this transaction. |


## Value Sent ##
[[Source]<br>](https://github.com/xdv/divvy-data-api/blob/develop/api/routes/valueSent.js "Source")

Retrieve the total amount of a single currency sent, in payments and currency exchanges, during a specific time period.

#### Request Format ####

<!-- <div class='multicode'> -->

*Reduced*

```
POST /api/value_sent
{
    "currency": "JPY",
    "issuer": "r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN",
    "startTime": "2015-01-15 08:00 Z",
    "endTime": "2015-01-15 10:59 Z",
    "timeIncrement": "hour",
    "descending": false,
    "reduce": true,
    "format": "json"
}
```

*Expanded*

```
POST /api/value_sent
{
    "currency": "JPY",
    "issuer": "r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN",
    "startTime": "2015-01-15 08:00 Z",
    "endTime": "2015-01-15 08:01 Z",
    "reduce": false,
    "limit": 3,
    "offset": 0,
    "format": "json"
}
```

<!-- </div> -->

[Try it! >](https://xdv.io/build/charts-api-tool/#value-sent)

The request includes the following body parameters:

| Field | Value | Description |
|-------|-------|-------------|
| currency | String | Three-letter [ISO 4217 Currency Code](http://www.xe.com/iso4217.php) string, or a 160-bit hex string according to Divvy's internal [Currency format](https://wiki.xdv.io/Currency_format). |
| issuer | String | Account address of the counterparty holding the currency. Usually an issuing gateway in the Divvy network. Omitted or `null` for XDV. |
| startTime | String ([Date-Time][]) | Retrieve information starting at this time. |
| endTime | String ([Date-Time][]) | Retrieve information ending at this time. |
| timeIncrement | String | (Optional) Divide results into intervals of the specified length: `year`, `month`, `day`, `hour`, `minute`, or `second`. The value `all` collapses the results into just one interval. Defaults to `all`. |
| descending | Boolean | (Optional) If true, return results in descending order. Defaults to false. |
| reduce | Boolean | (Optional) If `false`, include transactions individually instead of collapsing them into results over time. Ignored if `timeIncrement` is provided. Defaults to `true`. |
| limit | Number | (Optional) If reduce is `false`, this value defines the maximum number of transactions to return in one response. Use with `offset` to paginate results. Defaults to 500. |
| offset | Number | (Optional) If reduce is `false`, this value defines a number of transactions to skip before returning results. Use with `limit` to paginate results. Defaults to 0. |
| format | String | (Optional) The [Response Format][] to use: `csv` or `json`. If omitted, defaults to a CSV-like JSON array format. |

#### Response Format ####

The format of the response depends on the `format` and `reduce` parameters from the request. See [Response Format][] for details. Examples of successful responses:

<!-- <div class='multicode'> -->

*Reduced*

```
{
    "currency": "JPY",
    "issuer": "r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN",
    "startTime": "2015-01-15T08:00:00+00:00",
    "endTime": "2015-01-15T10:59:00+00:00",
    "timeIncrement": "hour",
    "results": [
        {
            "time": "2015-01-15T08:00:00+00:00",
            "amount": 1152046.1607243735,
            "count": 190
        },
        {
            "time": "2015-01-15T09:00:00+00:00",
            "amount": 483892.1115109554,
            "count": 84
        },
        {
            "time": "2015-01-15T10:00:00+00:00",
            "amount": 485985.50256177614,
            "count": 72
        }
    ]
}
```

*Expanded*

```
{
    "currency": "JPY",
    "issuer": "r94s8px6kSw1uZ1MV98dhSRTvc6VMPoPcN",
    "startTime": "2015-01-15T08:00:00+00:00",
    "endTime": "2015-01-15T08:01:00+00:00",
    "results": [
        {
            "time": "2015-01-15T08:00:00+00:00",
            "amount": 18081.50257044235,
            "account": "rPCFVxAqP2XdaPmih1ZSjmCPNxoyMiy2ne",
            "destination": null,
            "txHash": "64520542AB1F3EEF516DE3E07E4958F3C07AC668D4B3DE769AF08D305AFA50D1",
            "ledgerIndex": 11130438
        },
        {
            "time": "2015-01-15T08:01:00+00:00",
            "amount": 0.0000010567819117568433,
            "account": "rfU3YWd1TnYryvryQTQ9xwyCSqzMTbnyW6",
            "destination": null,
            "txHash": "52B282E616B2B9AD5E34B3BDE2D6D0AB44D06298590D3A949C2D7817D3057957",
            "ledgerIndex": 11130451
        }
    ]
}
```

<!-- </div> -->

**If the results are reduced** (the default), then each result represents an interval of time, with the following attributes:

| Field | Type | Description |
|-------|------|-------------|
| time | String ([Date-Time][]) | The time at which this interval begins. |
| amount | Number | The total amount of the requested currency sent during this interval |
| count | Number | The total number of transactions in this interval that contributed to the `amount`. |


**If the results are not reduced** (the request used `"reduce": false`), then each result represents an individual transaction, with the following attributes, in order:

| Field | Type | Description |
|-------|------|-------------|
| time | String ([Date-Time][]) | The time this transaction occurred. |
| amount | Number | The amount of the requested currency sent in this transaction. |
| account | String (Divvy Address) | The address of the account that sent this transaction. |
| destination | String (Divvy Address) | The address of the account that received the funds. Due to [RD-111](https://divvylabs.atlassian.net/browse/RD-111), this value is always returned as `null` instead. |
| txHash | String (Transaction Hash) | The identifying hash of this transaction. |
| ledgerIndex | Number (Ledger Index) | The identifying sequence number of the ledger that included this transaction. |


