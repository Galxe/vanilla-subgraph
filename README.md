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

1. **Get Contract Global Statistics**
```graphql
{
  contractStats(id: "0x994b9a6c85e89c42ea7cc14d42afdf2ea68b72f1") {
    totalAddresses    # Total number of unique addresses
    totalTxCount     # Total number of transactions
    totalVolume      # Total transaction volume
    updatedAt        # Last update timestamp
  }
}
```

2. **Get Daily Address Statistics**
```graphql
# Get statistics for a specific address
{
  dailyAddressStats(
    where: { 
      contract: "0x994b9a6c85e89c42ea7cc14d42afdf2ea68b72f1",
      address: "0x..."
    }
    orderBy: date
    orderDirection: desc
    first: 30
  ) {
    date
    txCount    # Daily transaction count
    volume     # Daily transaction volume
  }
}

# Get top addresses by volume for a specific day
{
  dailyAddressStats(
    where: { 
      contract: "0x994b9a6c85e89c42ea7cc14d42afdf2ea68b72f1",
      date: 20240301
    }
    orderBy: volume
    orderDirection: desc
    first: 10
  ) {
    address
    txCount
    volume
  }
}

# Get top addresses by transaction count for a specific day
{
  dailyAddressStats(
    where: { 
      contract: "0x994b9a6c85e89c42ea7cc14d42afdf2ea68b72f1",
      date: 20240301
    }
    orderBy: txCount
    orderDirection: desc
    first: 10
  ) {
    address
    txCount
    volume
  }
}
```

### Data Structure

1. **ContractStats (Global Statistics)**
   - `id`: Contract address
   - `totalAddresses`: Total number of unique addresses
   - `totalTxCount`: Total number of transactions
   - `totalVolume`: Total transaction volume
   - `updatedAt`: Last update timestamp

2. **DailyAddressStats (Daily Address Statistics)**
   - `id`: Format: "{contract}-{address}-{yyyyMMdd}"
   - `contract`: Contract address
   - `address`: User address
   - `date`: Date (YYYYMMDD)
   - `txCount`: Daily transaction count
   - `volume`: Daily transaction volume

3. **AddressTracker (Address Tracking)**
   - `id`: Format: "{contract}-{address}"
   - `contract`: Contract address
   - `address`: User address

### Event Handlers

The subgraph tracks the following events:
- `BuyTicket`: When a user buys a ticket
- `CancelTicket`: When a user cancels a ticket
- `CreateOrder`: When a user creates an order
- `DepositFund`: When a user deposits funds
- `WithdrawFund`: When a user withdraws funds
- `SettleOrder`: When an order is settled

### Updating the Subgraph

1. Make changes to the schema, mappings, or configuration
2. Regenerate types with `graph codegen`
3. Build the updated subgraph with `graph build`
4. Deploy the new version with `graph deploy`

### Endpoints
