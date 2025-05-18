## Setup and Usage Flow

### Prerequisites

- Node.js and npm/yarn installed
- Graph CLI installed (`npm install -g @graphprotocol/graph-cli`)
- Access to a Graph account (for hosted service) or a Graph Node (for local deployment)

### Basic Workflow

1. **Clone and Install Dependencies**

```bash
git clone https://github.com/galxe/vanilla-subgraph.git
cd vanilla-subgraph
yarn install
```

2. **Generate Types**

```bash
graph codegen
```

3. **Build the Subgraph**

```bash
graph build
```

4. **Deploy the Subgraph**

For hosted service:
```bash
# Authenticate (do this once)
graph auth --product hosted-service <YOUR_ACCESS_TOKEN>

# Deploy
graph deploy 
```

### Querying the Subgraph

After deployment, you can query the subgraph using GraphQL. Here are some example queries:

1. **Get Global Statistics**
```graphql
{
  globalData(id: "singleton") {
    uniqueUsers
    totalTransactions
    totalVolume
  }
}
```

2. **Get Daily Statistics**
```graphql
{
  dayDatas(orderBy: timestamp, orderDirection: desc, first: 30) {
    id
    timestamp
    uniqueUsers
    transactions
    volume
  }
}
```

3. **Get User Statistics**
```graphql
{
  userStats(where: { id: "0x..." }) {
    id
    volume
  }
}
```

4. **Get Top Users by Volume**
```graphql
{
  userStats(orderBy: volume, orderDirection: desc, first: 10) {
    id
    volume
  }
}
```


### Updating the Subgraph

1. Make changes to the schema, mappings, or configuration
2. Regenerate types with `graph codegen`
3. Build the updated subgraph with `graph build`
4. Deploy the new version with `graph deploy`

### Endpoints
