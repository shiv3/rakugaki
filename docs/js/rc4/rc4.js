const KSA = (K) => {
    let S = [];
    for(let q=0;q<256;q++){S.push(q)}
    for(let i=0,j=0;i<256;i++){
        j = (j + S[i] + K[i % K.length].charCodeAt())%256;
        [S[i], S[j]] = [S[j], S[i]];
    }
    return S;
}
function* PRGA(S){
    let i =0,j = 0;
    while(1){
        i = (i + 1) % 256;
        j = (j + S[i]) % 256;
        [S[i], S[j]] = [S[j], S[i]];
        let Z =  S[(S[i] + S[j]) % 256];   
        yield Z;
    }
}
const S2B = (src) => { //String2Byte
  let bytes = [];  
  Array.prototype.forEach.call(src, (s) => {
    bytes.push(s.charCodeAt());
  });
  return bytes;
}
const zip = (arrs)  => {
    return arrs[0].map((_,i) => {
        return arrs.map((arr) => {return arr[i]})
    });
}
const RC4 = (data,key) => {
    let S = KSA(key);
    let gen = PRGA(S);
    let d = S2B(data);
    let result = [];
    d.forEach((c) => {
        let n = gen.next().value;
        let r=String.fromCharCode( c^n );
        let t=(c^n).toString(16)
        result.push(r);
    });
    return result.join("");
}


const message = '解放乙女　ｳﾞｧﾙｷｭﾘｱ！';
const key = 'かしこまっ！';

console.log("平文:" + message);
console.log("鍵:" + key);
const ciphertext = RC4(message, key);
console.log("暗号文:" + ciphertext);
const message2 = RC4(ciphertext, key);
console.log("復号化:" + message2);

