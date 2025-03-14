/**
 * Chuyển đổi IPFS URI thành Gateway URL
 * @param {string} uri - IPFS URI (ipfs://...)
 * @returns {string} Gateway URL
 */
const ipfsUriToGatewayUrl = (uri) => {
    if (!uri) return null;
    
    // Extract CID từ ipfs://
    const cid = uri.replace('ipfs://', '');
    
    // Sử dụng public IPFS gateway
    return `https://ipfs.io/ipfs/${cid}`;
  };
  
  /**
   * Chuyển đổi Gateway URL thành IPFS URI
   * @param {string} url - Gateway URL
   * @returns {string} IPFS URI
   */
  const gatewayUrlToIpfsUri = (url) => {
    if (!url) return null;
    
    // Kiểm tra nhiều loại gateway URL
    const patterns = [
      /https?:\/\/ipfs\.io\/ipfs\/([a-zA-Z0-9]+)/,
      /https?:\/\/gateway\.pinata\.cloud\/ipfs\/([a-zA-Z0-9]+)/,
      /https?:\/\/[a-z0-9]+\.ipfs\.dweb\.link\/?/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return `ipfs://${match[1]}`;
      }
    }
    
    return null;
  };
  
  module.exports = {
    ipfsUriToGatewayUrl,
    gatewayUrlToIpfsUri
  };