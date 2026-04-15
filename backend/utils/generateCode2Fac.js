function generateCode2Fac() {
    const code = Math.floor(100000 + Math.random() * 900000);
    return String(code);
}
  
module.exports = generateCode2Fac;