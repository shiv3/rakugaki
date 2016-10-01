a=(b)=>{console.log(b);return b>2?a(b-1):1}

a=(b)=>((b)=>{console.log(b);return b>2?a(b-1):1})(b)



a=(b)=>( (c)=>( (d,e) => { console.log(b,c,d,e) } ) )
a(1)(2)(3,5)






fobbo


a=(b)=>{return b<2?b:a(b-2)+a(b-1)}

a=(b)=[()=>{}]

a=(b)=>{return (  )=>a}



a=(b)=>{return (b)=>a(b)}

a=(b)=>a

a=((b)=>{return(b+1)})

a=(b)=>a((b)=>{return b<2?1:b-1})


