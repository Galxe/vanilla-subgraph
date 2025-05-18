import { BigDecimal, BigInt, Bytes, ethereum, Address } from "@graphprotocol/graph-ts"
import { BridgehubDepositInitiated, WithdrawalFinalizedSharedBridge } from "../generated/Bridgehub/Bridgehub"
import { DayData, GlobalData, UserStats } from "../generated/schema"

// constants
const CHAIN_ID_TARGET = 325
const USDT_ADDRESS = "0xdac17f958d2ee523a2206206994597c13d831ec7".toLowerCase()

// 用于追踪每日用户
let dailyUsers = new Set<string>()

function getOrCreateUserStats(address: string): UserStats {
  let userStats = UserStats.load(address)
  if (userStats == null) {
    userStats = new UserStats(address)
    userStats.volume = BigDecimal.zero()
  }
  return userStats!
}

function getOrCreateDayData(timestamp: BigInt): DayData {
  let dayID = (timestamp.toI32() / 86400).toString()
  let dayData = DayData.load(dayID)
  if (dayData == null) {
    dayData = new DayData(dayID)
    dayData.uniqueUsers = BigInt.zero()
    dayData.transactions = BigInt.zero()
    dayData.volume = BigDecimal.zero()
    dayData.timestamp = BigInt.fromI32((timestamp.toI32() / 86400) * 86400)
  }
  return dayData!
}

function getOrCreateGlobalData(): GlobalData {
  let global = GlobalData.load("singleton")
  if (global == null) {
    global = new GlobalData("singleton")
    global.uniqueUsers = BigInt.zero()
    global.totalTransactions = BigInt.zero()
    global.totalVolume = BigDecimal.zero()
  }
  return global!
}

function recordTransaction(
  userAddress: string,
  amount: BigDecimal,
  timestamp: BigInt
): void {
  // 更新用户交易额
  let userStats = getOrCreateUserStats(userAddress)
  userStats.volume = userStats.volume.plus(amount)
  userStats.save()

  let dayData = getOrCreateDayData(timestamp)
  let global = getOrCreateGlobalData()
  
  // 更新每日数据
  if (!dailyUsers.has(userAddress)) {
    dayData.uniqueUsers = dayData.uniqueUsers.plus(BigInt.fromI32(1))
    dailyUsers.add(userAddress)
  }
  dayData.transactions = dayData.transactions.plus(BigInt.fromI32(1))
  dayData.volume = dayData.volume.plus(amount)
  dayData.save()

  // 更新全局数据
  global.totalTransactions = global.totalTransactions.plus(BigInt.fromI32(1))
  global.totalVolume = global.totalVolume.plus(amount)
  
  // 检查是否是新的全局用户
  let userKey = "user:" + userAddress
  let existingUser = GlobalData.load(userKey)
  if (existingUser == null) {
    global.uniqueUsers = global.uniqueUsers.plus(BigInt.fromI32(1))
    let newUser = new GlobalData(userKey)
    newUser.save()
  }
  
  global.save()
}

// 每天重置每日用户集合
export function handleBlock(block: ethereum.Block): void {
  if (block.timestamp.toI32() % 86400 == 0) {
    dailyUsers.clear()
  }
}

export function handleDepositBridgehub(event: BridgehubDepositInitiated): void {
  if (event.params.chainId.toI32() != CHAIN_ID_TARGET) {
    return
  }

  let amount = event.params.amount.toBigDecimal().div(BigDecimal.fromString('1000000'))
  recordTransaction(
    event.params.from.toHexString(),
    amount,
    event.block.timestamp
  )
}

export function handleWithdrawalBridgehub(event: WithdrawalFinalizedSharedBridge): void {
  if (event.params.chainId.toI32() != CHAIN_ID_TARGET) {
    return
  }
  
  if (event.params.l1Token.toHexString().toLowerCase() != USDT_ADDRESS) {
    return
  }
  
  let amount = event.params.amount.toBigDecimal().div(BigDecimal.fromString('1000000'))
  recordTransaction(
    event.params.to.toHexString(),
    amount,
    event.block.timestamp
  )
}
