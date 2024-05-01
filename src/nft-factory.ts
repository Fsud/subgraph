import {
  NFTCreated as NFTCreatedEvent,
} from "../generated/NFTFactory/NFTFactory"

import { Transfer as TransferEvent, S2NFT } from "../generated/templates/S2NFT/S2NFT"
import { S2NFT as S2NFTTemplate } from "../generated/templates"
import { NFT, TokenInfo } from "../generated/schema"
import { Address } from "@graphprotocol/graph-ts"

export function handleNFTCreated(event: NFTCreatedEvent): void {
  let entity = new NFT(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.nftCA = event.params.nftCA
  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.save()

  S2NFTTemplate.create(event.params.nftCA);
}

/**
 * 新增或修改tokenInfo
 */
export function handleTransfer(event: TransferEvent): void {
  let entity: TokenInfo | null;
  if (event.params.from.equals(Address.zero())) {
    entity = new TokenInfo(
      event.address.toHexString().concat(event.params.tokenId.toString())
    )
  } else {
    entity = TokenInfo.load(event.address.toHexString().concat(event.params.tokenId.toString()))
  }
  if (entity == null) {
    return;
  }
  entity.ca = event.address;
  entity.tokenId = event.params.tokenId;
  let s2Nft = S2NFT.bind(event.address);
  entity.tokenURL = s2Nft.tokenURI(event.params.tokenId);
  entity.name = s2Nft.name()
  entity.owner = event.params.to;
  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;
  entity.save();
}