import { Bytes, ByteArray, BigInt } from "@graphprotocol/graph-ts"

export function sliceBytes(data: Bytes, start: number, length: number): Bytes {
  // @ts-ignore: AssemblyScript specific type casting
  let result = new Uint8Array(length as i32)
  for (let i = 0; i < length; i++) {
    // @ts-ignore: AssemblyScript specific type casting
    result[i] = data[(start as i32) + (i as i32)]
  }
  return Bytes.fromUint8Array(result)
}

export function bytesToBigInt(data: Bytes): BigInt {
  return BigInt.fromUnsignedBytes(data as ByteArray)
}
