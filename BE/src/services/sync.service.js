
async function syncNFTEvents() {
    try {
      console.log('Syncing NFT events from blockchain...');
      
      const { nftMedia, marketplace } = blockchainService.getContracts();
      const provider = blockchainService.getProvider();
      
      // Lấy số block hiện tại
      const currentBlock = await provider.getBlockNumber();
      
      // Tính toán block bắt đầu (24 giờ trước)
      // Giả sử trung bình 15 giây/block
      const blocksPerDay = Math.floor((24 * 60 * 60) / 15);
      const fromBlock = Math.max(0, currentBlock - blocksPerDay);
      
      console.log(`Scanning blocks from ${fromBlock} to ${currentBlock}`);
      
      // 1. Sync mint events
      const nftCreatedFilter = nftMedia.filters.NFTCreated();
      const createdEvents = await nftMedia.queryFilter(nftCreatedFilter, fromBlock, currentBlock);
      
      console.log(`Found ${createdEvents.length} NFT created events`);
      
      // Xử lý từng event
      for (const event of createdEvents) {
        const [tokenId, creator, tokenURI] = event.args;
        console.log(`Processing NFT #${tokenId} creation by ${creator}`);
        
        // Kiểm tra NFT đã tồn tại trong database chưa
        const existingNFT = await NFTCache.findOne({ tokenId: tokenId.toString() });
        if (!existingNFT) {
          // Lấy metadata từ IPFS
          let metadata = {};
          try {
            metadata = await ipfsService.getIPFSJson(tokenURI);
          } catch (error) {
            console.error(`Error fetching metadata for NFT #${tokenId}:`, error);
          }
          
          // Lưu vào database
          await NFTCache.create({
            tokenId: tokenId.toString(),
            creator: creator.toLowerCase(),
            owner: creator.toLowerCase(),
            tokenURI,
            metadata: {
              name: metadata.name || `NFT #${tokenId}`,
              description: metadata.description || '',
              image: metadata.image || ''
            },
            mediaType: metadata.image && metadata.image.includes('.mp4') ? 'video' : 'image',
            mintedAt: new Date((await provider.getBlock(event.blockNumber)).timestamp * 1000),
            transactions: [{
              type: 'mint',
              from: '0x0000000000000000000000000000000000000000',
              to: creator.toLowerCase(),
              timestamp: new Date((await provider.getBlock(event.blockNumber)).timestamp * 1000),
              txHash: event.transactionHash
            }]
          });
        }
      }
      
      // 2. Sync sales events
      const nftSoldFilter = marketplace.filters.NFTSold();
      const soldEvents = await marketplace.queryFilter(nftSoldFilter, fromBlock, currentBlock);
      
      console.log(`Found ${soldEvents.length} NFT sold events`);
      
      // Xử lý từng event
      for (const event of soldEvents) {
        const [tokenId, seller, buyer, price] = event.args;
        console.log(`Processing NFT #${tokenId} sale: ${seller} -> ${buyer}`);
        
        // Cập nhật ownership trong database
        await NFTCache.findOneAndUpdate(
          { tokenId: tokenId.toString() },
          {
            $set: {
              owner: buyer.toLowerCase(),
              forSale: false,
              lastUpdated: new Date()
            },
            $push: {
              transactions: {
                type: 'sale',
                from: seller.toLowerCase(),
                to: buyer.toLowerCase(),
                price: ethers.utils.formatEther(price),
                timestamp: new Date((await provider.getBlock(event.blockNumber)).timestamp * 1000),
                txHash: event.transactionHash
              }
            }
          }
        );
        
        // Tạo thông báo cho người bán và người mua
        try {
          const nft = await NFTCache.findOne({ tokenId: tokenId.toString() });
          
          if (nft) {
            // Thông báo cho người bán
            await notificationService.createNotification({
              recipient: seller.toLowerCase(),
              type: 'sale',
              sender: buyer.toLowerCase(),
              content: `NFT "${nft.metadata.name}" đã được bán với giá ${ethers.utils.formatEther(price)} DX`,
              targetType: 'nft',
              targetId: tokenId.toString()
            });
            
            // Thông báo cho người mua
            await notificationService.createNotification({
              recipient: buyer.toLowerCase(),
              type: 'purchase',
              sender: seller.toLowerCase(),
              content: `Bạn đã mua NFT "${nft.metadata.name}" với giá ${ethers.utils.formatEther(price)} DX`,
              targetType: 'nft',
              targetId: tokenId.toString()
            });
          }
        } catch (notifyError) {
          console.error('Error creating notifications:', notifyError);
        }
      }
      
      console.log('NFT event sync completed');
    } catch (error) {
      console.error('Error syncing NFT events:', error);
    }
  }