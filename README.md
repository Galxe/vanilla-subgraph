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

1. **获取合约全局统计**
```graphql
{
  contractStats(id: "0x994b9a6c85e89c42ea7cc14d42afdf2ea68b72f1") {
    totalAddresses    # 累计交互地址数
    totalTxCount     # 累计交易笔数
    totalVolume      # 累计交易金额
    updatedAt        # 最后更新块时间
  }
}
```

2. **获取每日统计数据**
```graphql
# 获取最近30天的数据
{
  dailyStats(
    where: { contract: "0x994b9a6c85e89c42ea7cc14d42afdf2ea68b72f1" }
    orderBy: date
    orderDirection: desc
    first: 30
  ) {
    id
    date
    txCount    # 每日交易笔数
    volume     # 每日交易金额
  }
}
```

3. **获取地址每日统计**
```graphql
# 获取特定地址的每日统计
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
    txCount    # 每日交易笔数
    volume     # 每日交易金额
  }
}

# 获取某天交易量最大的前10个地址
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

# 获取某天交易次数最多的前10个地址
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

### 数据说明

1. **ContractStats (合约全局统计)**
   - `id`: 合约地址
   - `totalAddresses`: 累计交互地址数
   - `totalTxCount`: 累计交易笔数
   - `totalVolume`: 累计交易金额
   - `updatedAt`: 最后更新块时间

2. **DailyStats (每日统计)**
   - `id`: 格式为 "{contract}-{yyyyMMdd}"
   - `contract`: 合约地址
   - `date`: 日期 (YYYYMMDD)
   - `txCount`: 每日交易笔数
   - `volume`: 每日交易金额

3. **DailyAddressStats (地址每日统计)**
   - `id`: 格式为 "{contract}-{address}-{yyyyMMdd}"
   - `contract`: 合约地址
   - `address`: 用户地址
   - `date`: 日期 (YYYYMMDD)
   - `txCount`: 每日交易笔数
   - `volume`: 每日交易金额

### Updating the Subgraph

1. Make changes to the schema, mappings, or configuration
2. Regenerate types with `graph codegen`
3. Build the updated subgraph with `graph build`
4. Deploy the new version with `graph deploy`

### Endpoints
