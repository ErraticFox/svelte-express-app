import express, { request } from 'express'
import cors from 'cors'
import { resolve } from 'path'
import axios, { AxiosResponse } from 'axios'
import {
	AccountsBalanceGetRequest,
	AccountsGetRequest,
	Configuration,
	CountryCode,
	IdentityGetRequest,
	ItemPublicTokenExchangeRequest,
	LinkTokenCreateRequest,
	LinkTokenGetRequest,
	PlaidApi,
	PlaidEnvironments,
	Products,
	SandboxItemResetLoginRequest,
	SandboxPublicTokenCreateRequest,
	TransactionData,
	TransactionsGetRequest,
	TransactionsGetResponse,
} from 'plaid'
import { config } from 'dotenv'

config()

const app = express()

const port = process.env.PORT || 3000

app.use(cors())

const configuration = new Configuration({
	basePath: PlaidEnvironments.sandbox,
	baseOptions: {
		headers: {
			'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
			'PLAID-SECRET': process.env.PLAID_SECRET,
			'Plaid-Version': '2020-09-14',
		},
	},
})

const plaidClient = new PlaidApi(configuration)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.static('public'))

app.get('/', (req, res) => {
	res.sendFile(resolve(__dirname, 'public', 'index.html'))
})

app.get('/create-link-token', async (req, res) => {
	const request: LinkTokenCreateRequest = {
		user: {
			client_user_id: '343',
		},
		client_name: 'Plaid Test App',
		products: [Products.Transactions],
		language: 'en',
		country_codes: [CountryCode.Us],
	}

	try {
		const createTokenResponse = await plaidClient.linkTokenCreate(request)
		return res.json(createTokenResponse.data)
	} catch (error) {
		console.log(error)
	}
})

app.post('/api/get-balances', async (req, res) => {
	const request: AccountsBalanceGetRequest = {
		access_token: req.body['accessToken'],
	}
	try {
		const response = await plaidClient.accountsBalanceGet(request)
		const data = response.data.accounts
		return res.json(data)
	} catch (error) {
		// handle error
		return res.json(error)
	}
})

app.post('/api/get-identity', async (req, res) => {
	const request: IdentityGetRequest = {
		access_token: req.body['accessToken'],
	}
	try {
		const response = await plaidClient.identityGet(request)
		const data = response.data.accounts
		return res.json(data)
	} catch (error) {
		// handle error
		return res.json(error)
	}
})

app.post('/api/get-transactions', async (req, res) => {
	const request: TransactionsGetRequest = {
		access_token: req.body['accessToken'],
		start_date: '2021-01-01',
		end_date: '2021-02-01',
	}
	try {
		const response: AxiosResponse<TransactionsGetResponse> =
			await plaidClient.transactionsGet(request)
		console.log(response)
		// let transactions = response.data.transactions
		// const total_transactions = response.data.total_transactions
		// res.json(transactions)
	} catch (error) {
		// handle error
		return res.json(error)
	}
})

app.post('/api/get-accounts', async (req, res) => {
	const request: AccountsGetRequest = {
		access_token: req.body['accessToken'],
	}
	try {
		const response = await plaidClient.accountsGet(request)
		const data = response.data.accounts
		return res.json(data)
	} catch (error) {
		// handle error
		return res.json(error)
	}
})

app.post('/test', async (req, res) => {
	const request: IdentityGetRequest = {
		access_token: req.body['accessToken'],
	}

	try {
		const response = await plaidClient.identityGet(request)
		const identities = response.data.accounts.flatMap(
			(account) => account.owners
		)

		return res.json(identities)
	} catch (error) {
		// handle error
		// console.log(error)
	}
})

app.get('/get-sandbox-token', async (req, res) => {
	const access_token = await getSandboxToken()

	return res.json({ access_token })
})

app.get('/get-sandbox-access-token', getSandboxAccessToken)

async function getSandboxToken() {
	const publicTokenRequest: SandboxPublicTokenCreateRequest = {
		institution_id: 'ins_109508',
		initial_products: [Products.Identity],
	}

	try {
		const publicTokenResponse = await plaidClient.sandboxPublicTokenCreate(
			publicTokenRequest
		)
		return publicTokenResponse.data.public_token
	} catch (error) {
		console.log(error)
	}
}

async function getSandboxAccessToken(req, res) {
	try {
		const exchangeRequest: ItemPublicTokenExchangeRequest = {
			public_token: await getSandboxToken(),
		}
		const exchangeTokenResponse = await plaidClient.itemPublicTokenExchange(
			exchangeRequest
		)
		const accessToken = exchangeTokenResponse.data.access_token

		return res.json({ accessToken })
	} catch (error) {
		// handle error
		console.log(error)
	}
}

// app.post('/token-exchange', async (req, res) => {
// 	const { publicToken } = req.body
// 	const { access_token: accessToken } = await plaidClient.

// 	// plaidClient.itemPublicTokenExchange(req.body)
// })

app.listen(port, () => {
	console.log(`Server is up at port ${port}`)
})
