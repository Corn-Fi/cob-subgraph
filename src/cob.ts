import { Address, BigDecimal, BigInt, dataSource, log } from "@graphprotocol/graph-ts"
import {
  cob as CobContract,
  Approval,
  OwnershipTransferred,
  Transfer,
  cob
} from "../generated/undefined/cob"
import { Cob } from "../generated/schema"

const COB_ADDRESS = Address.fromString("0x648FA1E7Dd2722Ba93EC4Da99f2C32347522a37C")



export function fetchCobContract(): CobContract {
  return CobContract.bind(COB_ADDRESS)
}

export function fetchCob(): Cob {
  let cob = Cob.load(COB_ADDRESS.toHexString())
  if(cob === null) {
    const cc = fetchCobContract()
    cob = new Cob(COB_ADDRESS.toHexString())
    cob.name = cc.name()
    cob.symbol = cc.symbol()
    cob.decimals = BigInt.fromI32(cc.decimals())
    cob.totalSupply = BigDecimal.zero()
    cob.save()
  }
  return cob as Cob
}

export function handleTransfer(event: Transfer): void {
  let cob = fetchCob()
  log.debug('from {} to {} value {}', [event.params.from.toHexString(), event.params.to.toHexString(), event.params.value.toString()])
  const denominator = BigInt.fromI32(10).pow(18).toBigDecimal()
  if(Address.zero().equals(event.params.from)) {
    log.debug('from zero', [])
    const cobMinted = event.params.value.toBigDecimal().div(denominator)
    cob.totalSupply = cob.totalSupply.plus(cobMinted)
  }
  else if(Address.zero().equals(event.params.to)) {
    log.debug('to zero', [])
    let cob = fetchCob()
    const cobBurned = event.params.value.toBigDecimal().div(denominator)
    cob.totalSupply = cob.totalSupply.minus(cobBurned)
  }
  cob.save()
}
