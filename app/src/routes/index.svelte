<script lang="ts">
import { onMount } from 'svelte';

    let handler

    const createLinkToken = async () => {
        const response = await fetch('http://localhost:5000/create-link-token')
        const linkToken = await response.json() 
        return linkToken
    }

    const fetchSandboxToken = async () => {
        const response = await fetch('http://localhost:5000/get-sandbox-token')
        const sandboxToken = await response.json() 
        return sandboxToken
    }

    const fetchSandboxAccessToken = async () => {
        const response = await fetch('http://localhost:5000/get-sandbox-access-token')
        const sandboxAccessToken = await response.json() 
        return sandboxAccessToken
    }

    const resetLogin = async () => {
        const response = await fetch('http://localhost:5000/reset-login')
        const sandboxToken = await response.json() 
        return sandboxToken
    }
    
    const test = async () => {

        const response = await get('get-transactions')

        console.log(await response.json())
     
    }

    const get = async (endpoint) => {
        const access_token = await fetchSandboxAccessToken()

        const response = await fetch(`http://localhost:5000/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(access_token)
        })

        return response
    }

    async function loginWithPlaid() {
        const Plaid = window['Plaid']

        handler = Plaid.create({
            token: (await fetchSandboxToken()),
            env: 'sandbox',
            product: ['identity'],
            clientName: 'Plaid Test App',
            webhook: 'https://ensl749odsfbmn3.m.pipedream.net',
            onSuccess: async (publicToken, metadata) => {
                console.log(publicToken, metadata)
                const test = await fetch('/get-sandbox-token')
                console.log(test)
            },
            onLoad: () => {},
            onExit: (err, metadata) => console.log(err, metadata),
            onEvent: (eventName, metadata) => console.log(eventName, metadata),
        })
        handler.open()
    }

    
</script>

<svelte:head>
	<script src="https://cdn.plaid.com/link/v2/stable/link-initialize.js"></script>
</svelte:head>

<button on:click="{loginWithPlaid}">Login with Plaid</button>
<button on:click="{fetchSandboxToken}">Login with Plaid</button>
<button on:click="{test}">test</button>
<button on:click="{resetLogin}">Reset Login</button>
