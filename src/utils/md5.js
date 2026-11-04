/*
 * Lightweight pure-JS MD5.
 * Based on the public-domain implementation by Joseph Myers (1999).
 * No external dependencies; browser-compatible.
 */
export function md5(input) {
  function safeAdd(x, y) {
    const lsw = (x & 0xffff) + (y & 0xffff)
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xffff)
  }
  function bitRotateLeft(num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt))
  }
  function md5cmn(q, a, b, x, s, t) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
  }
  function md5ff(a, b, c, d, x, s, t) { return md5cmn((b & c) | (~b & d), a, b, x, s, t) }
  function md5gg(a, b, c, d, x, s, t) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t) }
  function md5hh(a, b, c, d, x, s, t) { return md5cmn(b ^ c ^ d, a, b, x, s, t) }
  function md5ii(a, b, c, d, x, s, t) { return md5cmn(c ^ (b | ~d), a, b, x, s, t) }

  function md5blk(s) {
    const md5blks = []
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] = s.charCodeAt(i) + (s.charCodeAt(i + 1) << 8) + (s.charCodeAt(i + 2) << 16) + (s.charCodeAt(i + 3) << 24)
    }
    return md5blks
  }

  const hex_chr = '0123456789abcdef'.split('')
  function rhex(n) {
    let s = ''
    for (let j = 0; j < 4; j++) {
      s += hex_chr[(n >> (j * 8 + 4)) & 0x0f] + hex_chr[(n >> (j * 8)) & 0x0f]
    }
    return s
  }

  function str2rstr_utf8(inp) {
    return unescape(encodeURIComponent(inp))
  }

  function rstr_md5(s) {
    const n = s.length
    const state = [1732584193, -271733879, -1732584194, 271733878]
    const M = []
    let i
    for (i = 64; i <= n; i += 64) {
      const blk = md5blk(s.substring(i - 64, i))
      let [a, b, c, d] = state
      a = md5ff(a, b, c, d, blk[0], 7, -680876936); d = md5ff(d, a, b, c, blk[1], 12, -389564586); c = md5ff(c, d, a, b, blk[2], 17, 606105819); b = md5ff(b, c, d, a, blk[3], 22, -1044525330)
      a = md5ff(a, b, c, d, blk[4], 7, -176418897); d = md5ff(d, a, b, c, blk[5], 12, 1200080426); c = md5ff(c, d, a, b, blk[6], 17, -1473231341); b = md5ff(b, c, d, a, blk[7], 22, -45705983)
      a = md5ff(a, b, c, d, blk[8], 7, 1770035416); d = md5ff(d, a, b, c, blk[9], 12, -1958414417); c = md5ff(c, d, a, b, blk[10], 17, -42063); b = md5ff(b, c, d, a, blk[11], 22, -1990404162)
      a = md5ff(a, b, c, d, blk[12], 7, 1804603682); d = md5ff(d, a, b, c, blk[13], 12, -40341101); c = md5ff(c, d, a, b, blk[14], 17, -1502002290); b = md5ff(b, c, d, a, blk[15], 22, 1236535329)
      a = md5gg(a, b, c, d, blk[1], 5, -165796510); d = md5gg(d, a, b, c, blk[6], 9, -1069501632); c = md5gg(c, d, a, b, blk[11], 14, 643717713); b = md5gg(b, c, d, a, blk[0], 20, -373897302)
      a = md5gg(a, b, c, d, blk[5], 5, -701558691); d = md5gg(d, a, b, c, blk[10], 9, 38016083); c = md5gg(c, d, a, b, blk[15], 14, -660478335); b = md5gg(b, c, d, a, blk[4], 20, -405537848)
      a = md5gg(a, b, c, d, blk[9], 5, 568446438); d = md5gg(d, a, b, c, blk[14], 9, -1019803690); c = md5gg(c, d, a, b, blk[3], 14, -187363961); b = md5gg(b, c, d, a, blk[8], 20, 1163531501)
      a = md5gg(a, b, c, d, blk[13], 5, -1444681467); d = md5gg(d, a, b, c, blk[2], 9, -51403784); c = md5gg(c, d, a, b, blk[7], 14, 1735328473); b = md5gg(b, c, d, a, blk[12], 20, -1926607734)
      a = md5hh(a, b, c, d, blk[5], 4, -378558); d = md5hh(d, a, b, c, blk[8], 11, -2022574463); c = md5hh(c, d, a, b, blk[11], 16, 1839030562); b = md5hh(b, c, d, a, blk[14], 23, -35309556)
      a = md5hh(a, b, c, d, blk[1], 4, -1530992060); d = md5hh(d, a, b, c, blk[4], 11, 1272893353); c = md5hh(c, d, a, b, blk[7], 16, -155497632); b = md5hh(b, c, d, a, blk[10], 23, -1094730640)
      a = md5hh(a, b, c, d, blk[13], 4, 681279174); d = md5hh(d, a, b, c, blk[0], 11, -358537222); c = md5hh(c, d, a, b, blk[3], 16, -722521979); b = md5hh(b, c, d, a, blk[6], 23, 76029189)
      a = md5hh(a, b, c, d, blk[9], 4, -640364487); d = md5hh(d, a, b, c, blk[12], 11, -421815835); c = md5hh(c, d, a, b, blk[15], 16, 530742520); b = md5hh(b, c, d, a, blk[2], 23, -995338651)
      a = md5ii(a, b, c, d, blk[0], 6, -198630844); d = md5ii(d, a, b, c, blk[7], 10, 1126891415); c = md5ii(c, d, a, b, blk[14], 15, -1416354905); b = md5ii(b, c, d, a, blk[5], 21, -57434055)
      a = md5ii(a, b, c, d, blk[12], 6, 1700485571); d = md5ii(d, a, b, c, blk[3], 10, -1894986606); c = md5ii(c, d, a, b, blk[10], 15, -1051523); b = md5ii(b, c, d, a, blk[1], 21, -2054922799)
      a = md5ii(a, b, c, d, blk[8], 6, 1873313359); d = md5ii(d, a, b, c, blk[15], 10, -30611744); c = md5ii(c, d, a, b, blk[6], 15, -1560198380); b = md5ii(b, c, d, a, blk[13], 21, 1309151649)
      a = md5ii(a, b, c, d, blk[4], 6, -145523070); d = md5ii(d, a, b, c, blk[11], 10, -1120210379); c = md5ii(c, d, a, b, blk[2], 15, 718787259); b = md5ii(b, c, d, a, blk[9], 21, -343485551)
      state[0] = safeAdd(a, state[0]); state[1] = safeAdd(b, state[1]); state[2] = safeAdd(c, state[2]); state[3] = safeAdd(d, state[3])
    }
    const tail = s.substring(i - 64)
    const length8 = tail.length
    for (let i = 0; i < length8; i++) M[i >> 2] |= tail.charCodeAt(i) << ((i % 4) * 8)
    M[length8 >> 2] |= 0x80 << ((length8 % 4) * 8)
    if (length8 % 64 > 55) {
      let [a, b, c, d] = state
      a = md5ff(a, b, c, d, M[0], 7, -680876936); d = md5ff(d, a, b, c, M[1], 12, -389564586); c = md5ff(c, d, a, b, M[2], 17, 606105819); b = md5ff(b, c, d, a, M[3], 22, -1044525330)
      a = md5ff(a, b, c, d, M[4], 7, -176418897); d = md5ff(d, a, b, c, M[5], 12, 1200080426); c = md5ff(c, d, a, b, M[6], 17, -1473231341); b = md5ff(b, c, d, a, M[7], 22, -45705983)
      a = md5ff(a, b, c, d, M[8], 7, 1770035416); d = md5ff(d, a, b, c, M[9], 12, -1958414417); c = md5ff(c, d, a, b, M[10], 17, -42063); b = md5ff(b, c, d, a, M[11], 22, -1990404162)
      a = md5ff(a, b, c, d, M[12], 7, 1804603682); d = md5ff(d, a, b, c, M[13], 12, -40341101); c = md5ff(c, d, a, b, M[14], 17, -1502002290); b = md5ff(b, c, d, a, M[15], 22, 1236535329)
      a = md5gg(a, b, c, d, M[1], 5, -165796510); d = md5gg(d, a, b, c, M[6], 9, -1069501632); c = md5gg(c, d, a, b, M[11], 14, 643717713); b = md5gg(b, c, d, a, M[0], 20, -373897302)
      a = md5gg(a, b, c, d, M[5], 5, -701558691); d = md5gg(d, a, b, c, M[10], 9, 38016083); c = md5gg(c, d, a, b, M[15], 14, -660478335); b = md5gg(b, c, d, a, M[4], 20, -405537848)
      a = md5gg(a, b, c, d, M[9], 5, 568446438); d = md5gg(d, a, b, c, M[14], 9, -1019803690); c = md5gg(c, d, a, b, M[3], 14, -187363961); b = md5gg(b, c, d, a, M[8], 20, 1163531501)
      a = md5gg(a, b, c, d, M[13], 5, -1444681467); d = md5gg(d, a, b, c, M[2], 9, -51403784); c = md5gg(c, d, a, b, M[7], 14, 1735328473); b = md5gg(b, c, d, a, M[12], 20, -1926607734)
      a = md5hh(a, b, c, d, M[5], 4, -378558); d = md5hh(d, a, b, c, M[8], 11, -2022574463); c = md5hh(c, d, a, b, M[11], 16, 1839030562); b = md5hh(b, c, d, a, M[14], 23, -35309556)
      a = md5hh(a, b, c, d, M[1], 4, -1530992060); d = md5hh(d, a, b, c, M[4], 11, 1272893353); c = md5hh(c, d, a, b, M[7], 16, -155497632); b = md5hh(b, c, d, a, M[10], 23, -1094730640)
      a = md5hh(a, b, c, d, M[13], 4, 681279174); d = md5hh(d, a, b, c, M[0], 11, -358537222); c = md5hh(c, d, a, b, M[3], 16, -722521979); b = md5hh(b, c, d, a, M[6], 23, 76029189)
      a = md5hh(a, b, c, d, M[9], 4, -640364487); d = md5hh(d, a, b, c, M[12], 11, -421815835); c = md5hh(c, d, a, b, M[15], 16, 530742520); b = md5hh(b, c, d, a, M[2], 23, -995338651)
      a = md5ii(a, b, c, d, M[0], 6, -198630844); d = md5ii(d, a, b, c, M[7], 10, 1126891415); c = md5ii(c, d, a, b, M[14], 15, -1416354905); b = md5ii(b, c, d, a, M[5], 21, -57434055)
      a = md5ii(a, b, c, d, M[12], 6, 1700485571); d = md5ii(d, a, b, c, M[3], 10, -1894986606); c = md5ii(c, d, a, b, M[10], 15, -1051523); b = md5ii(b, c, d, a, M[1], 21, -2054922799)
      a = md5ii(a, b, c, d, M[8], 6, 1873313359); d = md5ii(d, a, b, c, M[15], 10, -30611744); c = md5ii(c, d, a, b, M[6], 15, -1560198380); b = md5ii(b, c, d, a, M[13], 21, 1309151649)
      a = md5ii(a, b, c, d, M[4], 6, -145523070); d = md5ii(d, a, b, c, M[11], 10, -1120210379); c = md5ii(c, d, a, b, M[2], 15, 718787259); b = md5ii(b, c, d, a, M[9], 21, -343485551)
      state[0] = safeAdd(a, state[0]); state[1] = safeAdd(b, state[1]); state[2] = safeAdd(c, state[2]); state[3] = safeAdd(d, state[3])
      for (let i = 0; i < 16; i++) M[i] = 0
    }
    M[14] = n * 8
    let [a, b, c, d] = state
    a = md5ff(a, b, c, d, M[0], 7, -680876936); d = md5ff(d, a, b, c, M[1], 12, -389564586); c = md5ff(c, d, a, b, M[2], 17, 606105819); b = md5ff(b, c, d, a, M[3], 22, -1044525330)
    a = md5ff(a, b, c, d, M[4], 7, -176418897); d = md5ff(d, a, b, c, M[5], 12, 1200080426); c = md5ff(c, d, a, b, M[6], 17, -1473231341); b = md5ff(b, c, d, a, M[7], 22, -45705983)
    a = md5ff(a, b, c, d, M[8], 7, 1770035416); d = md5ff(d, a, b, c, M[9], 12, -1958414417); c = md5ff(c, d, a, b, M[10], 17, -42063); b = md5ff(b, c, d, a, M[11], 22, -1990404162)
    a = md5ff(a, b, c, d, M[12], 7, 1804603682); d = md5ff(d, a, b, c, M[13], 12, -40341101); c = md5ff(c, d, a, b, M[14], 17, -1502002290); b = md5ff(b, c, d, a, M[15], 22, 1236535329)
    a = md5gg(a, b, c, d, M[1], 5, -165796510); d = md5gg(d, a, b, c, M[6], 9, -1069501632); c = md5gg(c, d, a, b, M[11], 14, 643717713); b = md5gg(b, c, d, a, M[0], 20, -373897302)
    a = md5gg(a, b, c, d, M[5], 5, -701558691); d = md5gg(d, a, b, c, M[10], 9, 38016083); c = md5gg(c, d, a, b, M[15], 14, -660478335); b = md5gg(b, c, d, a, M[4], 20, -405537848)
    a = md5gg(a, b, c, d, M[9], 5, 568446438); d = md5gg(d, a, b, c, M[14], 9, -1019803690); c = md5gg(c, d, a, b, M[3], 14, -187363961); b = md5gg(b, c, d, a, M[8], 20, 1163531501)
    a = md5gg(a, b, c, d, M[13], 5, -1444681467); d = md5gg(d, a, b, c, M[2], 9, -51403784); c = md5gg(c, d, a, b, M[7], 14, 1735328473); b = md5gg(b, c, d, a, M[12], 20, -1926607734)
    a = md5hh(a, b, c, d, M[5], 4, -378558); d = md5hh(d, a, b, c, M[8], 11, -2022574463); c = md5hh(c, d, a, b, M[11], 16, 1839030562); b = md5hh(b, c, d, a, M[14], 23, -35309556)
    a = md5hh(a, b, c, d, M[1], 4, -1530992060); d = md5hh(d, a, b, c, M[4], 11, 1272893353); c = md5hh(c, d, a, b, M[7], 16, -155497632); b = md5hh(b, c, d, a, M[10], 23, -1094730640)
    a = md5hh(a, b, c, d, M[13], 4, 681279174); d = md5hh(d, a, b, c, M[0], 11, -358537222); c = md5hh(c, d, a, b, M[3], 16, -722521979); b = md5hh(b, c, d, a, M[6], 23, 76029189)
    a = md5hh(a, b, c, d, M[9], 4, -640364487); d = md5hh(d, a, b, c, M[12], 11, -421815835); c = md5hh(c, d, a, b, M[15], 16, 530742520); b = md5hh(b, c, d, a, M[2], 23, -995338651)
    a = md5ii(a, b, c, d, M[0], 6, -198630844); d = md5ii(d, a, b, c, M[7], 10, 1126891415); c = md5ii(c, d, a, b, M[14], 15, -1416354905); b = md5ii(b, c, d, a, M[5], 21, -57434055)
    a = md5ii(a, b, c, d, M[12], 6, 1700485571); d = md5ii(d, a, b, c, M[3], 10, -1894986606); c = md5ii(c, d, a, b, M[10], 15, -1051523); b = md5ii(b, c, d, a, M[1], 21, -2054922799)
    a = md5ii(a, b, c, d, M[8], 6, 1873313359); d = md5ii(d, a, b, c, M[15], 10, -30611744); c = md5ii(c, d, a, b, M[6], 15, -1560198380); b = md5ii(b, c, d, a, M[13], 21, 1309151649)
    a = md5ii(a, b, c, d, M[4], 6, -145523070); d = md5ii(d, a, b, c, M[11], 10, -1120210379); c = md5ii(c, d, a, b, M[2], 15, 718787259); b = md5ii(b, c, d, a, M[9], 21, -343485551)
    state[0] = safeAdd(a, state[0]); state[1] = safeAdd(b, state[1]); state[2] = safeAdd(c, state[2]); state[3] = safeAdd(d, state[3])
    return rhex(state[0]) + rhex(state[1]) + rhex(state[2]) + rhex(state[3])
  }

  return rstr_md5(str2rstr_utf8(input))
}
