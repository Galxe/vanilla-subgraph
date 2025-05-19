import { BigDecimal, BigInt, Bytes, ethereum, Address } from "@graphprotocol/graph-ts"
import { 
  BuyTicket,
  CancelTicket,
  CreateOrder,
  DepositFund,
  WithdrawFund,
  SettleOrder
} from "../generated/Bridgehub/Bridgehub"
import { ContractStats, DailyAddressStats, AddressTracker } from "../generated/schema"

// Constants
const CONTRACT_ADDRESS = "0x994b9a6c85e89c42ea7cc14d42afdf2ea68b72f1"

// Get or create contract statistics
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
  amount: BigDecimal,
  timestamp: BigInt
): void {
  // Update contract global statistics
  let contractStats = getOrCreateContractStats()
  contractStats.totalTxCount = contractStats.totalTxCount.plus(BigInt.fromI32(1))
  contractStats.totalVolume = contractStats.totalVolume.plus(amount)
  contractStats.updatedAt = timestamp

  // Check if this is a new address
  let addressKey = `${CONTRACT_ADDRESS}-${address}`
  let existingAddress = AddressTracker.load(addressKey)
  if (existingAddress == null) {
    contractStats.totalAddresses = contractStats.totalAddresses.plus(BigInt.fromI32(1))
    let newAddress = new AddressTracker(addressKey)
    newAddress.contract = CONTRACT_ADDRESS
    newAddress.address = address
    newAddress.save()
  }
  contractStats.save()

  // Update daily address statistics
  let date = getDayTimestamp(timestamp)
  let dailyStats = getOrCreateDailyAddressStats(address, date)
  dailyStats.txCount = dailyStats.txCount.plus(BigInt.fromI32(1))
  dailyStats.volume = dailyStats.volume.plus(amount)
  dailyStats.save()
}

// Handle buy ticket event
export function handleBuyTicket(event: BuyTicket): void {
  let amount = event.params.amount.toBigDecimal()
  amount = amount.div(BigDecimal.fromString('1000000000000000000'))
  
  recordTransaction(
    event.params.account.toHexString(),
    amount,
    event.block.timestamp
  )
}

// Handle cancel ticket event
export function handleCancelTicket(event: CancelTicket): void {
  let amount = event.params.amount.toBigDecimal()
  amount = amount.div(BigDecimal.fromString('1000000000000000000'))
  
  recordTransaction(
    event.params.account.toHexString(),
    amount,
    event.block.timestamp
  )
}

// Handle create order event
export function handleCreateOrder(event: CreateOrder): void {
  let amount = event.params.params.amount.toBigDecimal()
  amount = amount.div(BigDecimal.fromString('1000000000000000000'))
  
  recordTransaction(
    event.params.account.toHexString(),
    amount,
    event.block.timestamp
  )
}

// Handle deposit fund event
export function handleDepositFund(event: DepositFund): void {
  let amount = event.params.amount.toBigDecimal()
  amount = amount.div(BigDecimal.fromString('1000000000000000000'))
  
  recordTransaction(
    event.params.account.toHexString(),
    amount,
    event.block.timestamp
  )
}

// Handle withdraw fund event
export function handleWithdrawFund(event: WithdrawFund): void {
  let amount = event.params.amount.toBigDecimal()
  amount = amount.div(BigDecimal.fromString('1000000000000000000'))
  
  recordTransaction(
    event.params.account.toHexString(),
    amount,
    event.block.timestamp
  )
}

// Handle settle order event
export function handleSettleOrder(event: SettleOrder): void {
  let amount = event.params.revenue.toBigDecimal()
  amount = amount.div(BigDecimal.fromString('1000000000000000000'))
  
  recordTransaction(
    event.params.account.toHexString(),
    amount,
    event.block.timestamp
  )
}
