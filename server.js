"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = require("path");
const plaid_1 = require("plaid");
const dotenv_1 = require("dotenv");
dotenv_1.config();
const app = express_1.default();
const port = process.env.PORT || 3000;
app.use(cors_1.default());
const configuration = new plaid_1.Configuration({
    basePath: plaid_1.PlaidEnvironments.sandbox,
    baseOptions: {
        headers: {
            'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
            'PLAID-SECRET': process.env.PLAID_SECRET,
            'Plaid-Version': '2020-09-14',
        },
    },
});
const plaidClient = new plaid_1.PlaidApi(configuration);
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
app.use(express_1.default.static('public'));
app.get('/', (req, res) => {
    res.sendFile(path_1.resolve(__dirname, 'public', 'index.html'));
});
app.get('/create-link-token', async (req, res) => {
    const request = {
        user: {
            client_user_id: '343',
        },
        client_name: 'Plaid Test App',
        products: [plaid_1.Products.Transactions],
        language: 'en',
        country_codes: [plaid_1.CountryCode.Us],
    };
    try {
        const createTokenResponse = await plaidClient.linkTokenCreate(request);
        return res.json(createTokenResponse.data);
    }
    catch (error) {
        console.log(error);
    }
});
app.post('/api/get-balances', async (req, res) => {
    const request = {
        access_token: req.body['accessToken'],
    };
    try {
        const response = await plaidClient.accountsBalanceGet(request);
        const data = response.data.accounts;
        return res.json(data);
    }
    catch (error) {
        // handle error
        return res.json(error);
    }
});
app.post('/api/get-identity', async (req, res) => {
    const request = {
        access_token: req.body['accessToken'],
    };
    try {
        const response = await plaidClient.identityGet(request);
        const data = response.data.accounts;
        return res.json(data);
    }
    catch (error) {
        // handle error
        return res.json(error);
    }
});
app.post('/api/get-transactions', async (req, res) => {
    const request = {
        access_token: req.body['accessToken'],
        start_date: '2021-01-01',
        end_date: '2021-02-01',
    };
    try {
        const response = await plaidClient.transactionsGet(request);
        console.log(response);
        // let transactions = response.data.transactions
        // const total_transactions = response.data.total_transactions
        // res.json(transactions)
    }
    catch (error) {
        // handle error
        return res.json(error);
    }
});
app.post('/api/get-accounts', async (req, res) => {
    const request = {
        access_token: req.body['accessToken'],
    };
    try {
        const response = await plaidClient.accountsGet(request);
        const data = response.data.accounts;
        return res.json(data);
    }
    catch (error) {
        // handle error
        return res.json(error);
    }
});
app.post('/test', async (req, res) => {
    const request = {
        access_token: req.body['accessToken'],
    };
    try {
        const response = await plaidClient.identityGet(request);
        const identities = response.data.accounts.flatMap((account) => account.owners);
        return res.json(identities);
    }
    catch (error) {
        // handle error
        // console.log(error)
    }
});
app.get('/get-sandbox-token', async (req, res) => {
    const access_token = await getSandboxToken();
    return res.json({ access_token });
});
app.get('/get-sandbox-access-token', getSandboxAccessToken);
async function getSandboxToken() {
    const publicTokenRequest = {
        institution_id: 'ins_109508',
        initial_products: [plaid_1.Products.Identity],
    };
    try {
        const publicTokenResponse = await plaidClient.sandboxPublicTokenCreate(publicTokenRequest);
        return publicTokenResponse.data.public_token;
    }
    catch (error) {
        console.log(error);
    }
}
async function getSandboxAccessToken(req, res) {
    try {
        const exchangeRequest = {
            public_token: await getSandboxToken(),
        };
        const exchangeTokenResponse = await plaidClient.itemPublicTokenExchange(exchangeRequest);
        const accessToken = exchangeTokenResponse.data.access_token;
        return res.json({ accessToken });
    }
    catch (error) {
        // handle error
        console.log(error);
    }
}
// app.post('/token-exchange', async (req, res) => {
// 	const { publicToken } = req.body
// 	const { access_token: accessToken } = await plaidClient.
// 	// plaidClient.itemPublicTokenExchange(req.body)
// })
app.listen(port, () => {
    console.log(`Server is up at port ${port}`);
});
