import { BigDecimal, BigInt, Bytes, ethereum, Address } from "@graphprotocol/graph-ts"
import { 
  BuyTicket,
  CancelTicket,
  CreateOrder,
  DepositFund,
  WithdrawFund,
  SettleOrder,
  DailySignIn,
  PlatformCollectFee,
  ProfitSharingCollectFee,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  UpdateSlot0
} from "../generated/Volume/Volume"
import { ContractStats,ContractStatsByAddress, DailyAddressStats, AddressTracker, TransactionTracker, DailyContractStats } from "../generated/schema"

// Constants
const CONTRACT_ADDRESS = "0x994b9a6c85e89c42ea7cc14d42afdf2ea68b72f1"

function getOrCreateContractStats(): ContractStats {
  let stats = ContractStats.load(CONTRACT_ADDRESS)
  if (stats == null) {
    stats = new ContractStats(CONTRACT_ADDRESS)
    stats.totalAddresses = BigInt.zero()
    stats.totalTxCount = BigInt.zero()
    stats.totalVolume = BigDecimal.zero()
    stats.updatedAt = BigInt.zero()
  }
  return stats
}

// Get or create contract statistics
function getOrCreateDailyContractStats(date: BigInt): DailyContractStats {
  let id = `${CONTRACT_ADDRESS}-${date.toString()}`
  let stats = DailyContractStats.load(id)
  if (stats == null) {
    stats = new DailyContractStats(id)
    stats.totalAddresses = BigInt.zero()
    stats.totalTxCount = BigInt.zero()
    stats.totalVolume = BigDecimal.zero()
    stats.date = date
  }
  return stats
}

function getOrCreateContractStatsByAddress(address: string): ContractStatsByAddress {
  let id = `${CONTRACT_ADDRESS}-${address}`
  let stats = ContractStatsByAddress.load(id)
  if (stats == null) {
    stats = new ContractStatsByAddress(id)
    stats.address = address
    stats.totalTxCount = BigInt.zero()
    stats.totalVolume = BigDecimal.zero()
    stats.updatedAt = BigInt.zero()
  }
  return stats
}

// Get or create daily address statistics
function getOrCreateDailyAddressStats(
  address: string,
  date: BigInt
): DailyAddressStats {
  let id = `${CONTRACT_ADDRESS}-${address}-${date.toString()}`
  let stats = DailyAddressStats.load(id)
  if (stats == null) {
    stats = new DailyAddressStats(id)
    stats.contract = CONTRACT_ADDRESS
    stats.address = address
    stats.date = date
    stats.txCount = BigInt.zero()
    stats.volume = BigDecimal.zero()
  }
  return stats
}

// Get day timestamp
function getDayTimestamp(timestamp: BigInt): BigInt {
  return BigInt.fromI32((timestamp.toI32() / 86400) * 86400)
}

// Record transaction
function recordTransaction(
  address: string,
  volume: BigDecimal,
  timestamp: BigInt,
  txHash: string
): void {
  let isNewTx = false
  let txTracker = TransactionTracker.load(txHash)
  if (txTracker == null) {
    txTracker = new TransactionTracker(txHash)
    txTracker.save()
    isNewTx = true
  }

  // Get date timestamp
  let date = getDayTimestamp(timestamp)
  
  // Update daily contract statistics
  let contractStats = getOrCreateContractStats()
  let daidycontractStats = getOrCreateDailyContractStats(date)
  let addressStats = getOrCreateContractStatsByAddress(address)

  if (isNewTx) {
    daidycontractStats.totalTxCount = daidycontractStats.totalTxCount.plus(BigInt.fromI32(1))
    addressStats.totalTxCount = addressStats.totalTxCount.plus(BigInt.fromI32(1))
    contractStats.totalTxCount = contractStats.totalTxCount.plus(BigInt.fromI32(1))
  }
  
  daidycontractStats.totalVolume = daidycontractStats.totalVolume.plus(volume)
  addressStats.totalVolume = addressStats.totalVolume.plus(volume)
  contractStats.totalVolume = contractStats.totalVolume.plus(volume)
  contractStats.updatedAt = timestamp

  // Check if this is a new address
  let addressKey = `${CONTRACT_ADDRESS}-${address}`
  let existingAddress = AddressTracker.load(addressKey)
  if (existingAddress == null) {
    daidycontractStats.totalAddresses = daidycontractStats.totalAddresses.plus(BigInt.fromI32(1))
    contractStats.totalAddresses = contractStats.totalAddresses.plus(BigInt.fromI32(1))
    let newAddress = new AddressTracker(addressKey)
    newAddress.contract = CONTRACT_ADDRESS
    newAddress.address = address
    newAddress.save()
  }

  daidycontractStats.save()
  addressStats.save()
  contractStats.save()

  // Update daily address statistics
  let dailyStats = getOrCreateDailyAddressStats(address, date)
  if (isNewTx) {
    dailyStats.txCount = dailyStats.txCount.plus(BigInt.fromI32(1))
  }
  dailyStats.volume = dailyStats.volume.plus(volume)
  dailyStats.save()
}

// Handle buy ticket event
export function handleBuyTicket(event: BuyTicket): void {
  
  recordTransaction(
    event.params.account.toHexString(),
    BigDecimal.zero(),
    event.block.timestamp,
    event.transaction.hash.toHexString()
  )
}

// Handle cancel ticket event
export function handleCancelTicket(event: CancelTicket): void {
  
  recordTransaction(
    event.params.account.toHexString(),
    BigDecimal.zero(),
    event.block.timestamp,
    event.transaction.hash.toHexString()
  )
}

function toBD(n: BigInt): BigDecimal {  
  return n.toBigDecimal()  
           .div(BigDecimal.fromString('1000000000000000000'))  
}

function toBDNoScale(n: BigInt): BigDecimal {
  return n.toBigDecimal()
}

// Handle create order event
export function handleCreateOrder(event: CreateOrder): void {
  let p = event.params.params

  let quantity = toBD(p.quantity)            
  let price    = toBD(p.strike_price)   
  let sheet    = toBDNoScale(p.sheet)  
  let volume   = quantity.times(price).times(sheet)     

  recordTransaction(
    event.params.account.toHexString(),
    volume,
    event.block.timestamp,
    event.transaction.hash.toHexString()
  )
}

// Handle deposit fund event
export function handleDepositFund(event: DepositFund): void {
  recordTransaction(
    event.params.account.toHexString(),
    BigDecimal.zero(),
    event.block.timestamp,
    event.transaction.hash.toHexString()
  )
}

// Handle withdraw fund event
export function handleWithdrawFund(event: WithdrawFund): void {
  
  recordTransaction(
    event.params.account.toHexString(),
    BigDecimal.zero(),
    event.block.timestamp,
    event.transaction.hash.toHexString()
  )
}

// Handle settle order event
export function handleSettleOrder(event: SettleOrder): void {
  recordTransaction(
    event.params.account.toHexString(),
    BigDecimal.zero(),
    event.block.timestamp,
    event.transaction.hash.toHexString()
  )
}


// Handle DailySignIn event
export function handleDailySignIn(event: DailySignIn): void {
  let zero = BigDecimal.zero()
  recordTransaction(
    event.params.user.toHexString(),
    zero,
    event.block.timestamp,
    event.transaction.hash.toHexString()
  )
}

// Handle PlatformCollectFee event
export function handlePlatformCollectFee(event: PlatformCollectFee): void {
  recordTransaction(
    event.params.platformFeeAccount.toHexString(),
    BigDecimal.zero(),
    event.block.timestamp,
    event.transaction.hash.toHexString()
  )

}

// Handle ProfitSharingCollectFee event
export function handleProfitSharingCollectFee(event: ProfitSharingCollectFee): void {
  
  recordTransaction(
    event.params.profitSharingAccount.toHexString(),
    BigDecimal.zero(),
    event.block.timestamp,
    event.transaction.hash.toHexString()
  )
}

// Handle RoleAdminChanged event
export function handleRoleAdminChanged(event: RoleAdminChanged): void {
  let zero = BigDecimal.zero()
  recordTransaction(
    event.params.previousAdminRole.toHexString(), 
    zero,
    event.block.timestamp,
    event.transaction.hash.toHexString()
  )
}

// Handle RoleGranted event
export function handleRoleGranted(event: RoleGranted): void {
  let zero = BigDecimal.zero()
  recordTransaction(
    event.params.account.toHexString(),
    zero,
    event.block.timestamp,
    event.transaction.hash.toHexString()
  )
}

// Handle RoleRevoked event
export function handleRoleRevoked(event: RoleRevoked): void {
  let zero = BigDecimal.zero()
  recordTransaction(
    event.params.account.toHexString(),
    zero,
    event.block.timestamp,
    event.transaction.hash.toHexString()
  )
}

// Handle UpdateSlot0 event
export function handleUpdateSlot0(event: UpdateSlot0): void {
  let zero = BigDecimal.zero()
  recordTransaction(
    event.params.profitSharingAccount.toHexString(),
    zero,
    event.block.timestamp,
    event.transaction.hash.toHexString()
  )
}