# Subgraph Studio

## Prerequisite 
```bash
$ npm install -g @graphprotocol/graph-cli
$ graph help
```

## Get started:
Clone code:
```bash
git clone https://github.com/BLOCKCHAINDEVWEB/subgraph-nextjs.git
cd subgraph-nextjs
```

Duplicate the .env file given as an example:
```bash
cd client
cp .env.sample .env
```

Complete your .env file with
```bash
NEXT_PUBLIC_TEMPORARY_QUERY_URL=https://api.studio.thegraph.com/query/11783/zola/0.1.0
```

Install dependencies:
```bash
cd client
yarn
```

## Create your subgraph
Started your first subgraph
- Open url https://thegraph.com/en/
- Create your account network on TheGraph site on url https://thegraph.com/
- Select Subgraph Studio in The Graph list
- Click on button: Create a Subgraph
- Give your Subgraph Name
- Enter in your subgraph

In your terminal console:  
1. initialize your subgraph with smart-contract  
```bash
  $ graph init --contract-name Token \
  --index-events \
  --product subgraph-studio \
  --from-contract 0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7 
  ? Subgraph name » Zola
  ? Directory to create the subgraph in » Zola
  ? Ethereum network » mainnet
  ? Contract address » 0xabEFBc9fD2F806065b4f3C237d4b59D9A97Bcac7
  ? Contract Name » Token
```
2. authenticate whith your deploy key
```bash
$  graph auth --studio
? Deploy key » e03b9d...712d9f
```

3. generate types for contract ABIs and GraphQL schema
```bash
$ graph codegen && graph build
```

3. deploy your code
```bash
$ graph deploy --studio zola
? Version Label (e.g. v0.0.1) · v0.0.1
```

Open your subgraph
1. give an query in your playground
```graphql
{
  tokens(
    orderBy: createdAtTimestamp
    orderDirection: desc
  ) {
    id
    tokenID
    contentURI
    metadataURI
  }
}
```

2. use your endpoint in a loading playground GraphQL
- Open url https://www.graphqlbin.com/v2/new
- Paste your endpoint api subgraph: https://api.studio.thegraph.com/query/11783/zola/0.1.0
- Give an query similar to TheGraph or production playground

## Learn more
- Subgraph-studio: https://thegraph.com/blog/building-with-subgraph-studio
- Zora documentation: https://docs.zora.co/docs/smart-contracts/zora-contracts
